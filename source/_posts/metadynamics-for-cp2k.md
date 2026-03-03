---
title: metadynamics for cp2k
date: 2022-01-08 11:22:00
tags: [CP2K, Metadynamics, 计算化学]
categories: 计算化学
---

CP2K是著名的开源第一性原理材料计算和模拟软件, 广泛用于固体、液体、分子、周期、材料、晶体和生物系统的模拟。cp2k的开发者(The group of Prof. Jürg Hutter)很早就加入了增强采样的功能，相对其他第一性原理计算软件来说，cp2k的metadynamics功能还是比较完善的。cp2k的缺点就是多达数万个关键词的又臭又长的输入文件。

这里简单说明一下cp2k添加metadynamics的关键词的位置包括定义CV、限制CV和metadynamics参数设置。

## 定义CV

CV的定义和设置是在SUBSYS模块下：

```
&COLVAR 
 &DISTANCE 
  AXIS X
  ATOMS 1 4  #1 4号原子之间的距离
 &END DISTANCE
&END COLVAR

&COLVAR
 &DISTANCE_FUNCTION
  ATOMS 4 6 6 1 
  COEFFICIENT -1.00000 #变化系数a(CV=d1+a*d2)
  # distance 1 = ( 4 - 6 )
  # distance 2 = ( 6 - 1 ) #两组键长的距离函数
  &END DISTANCE_FUNCTION
 &END COLVAR #注意定义CV时不用添加标签，按顺序即可，后面设置参数时COLVAR 1 就是顺序第一个

&COLVAR
 &COORDINATION #配位数
  KINDS_FROM N #cp2k可以直接指定元素，不用原子label,这一点很nice
  KINDS_TO O
  R_0 [angstrom] 1.8 #截断距离
  NN 8
  ND 14 #配位数公式的指数参数，ND=2NN
 &END COORDINATION
 &END COLVAR

&COLVAR
 &RMSD#表征构型变化的RMSD，xtb的metadynamics就是以RMSD作为唯一CV的
  &FRAME
  COORD_FILE_NAME planar.xyz
 &END
  &FRAME
  COORD_FILE_NAME cage.xyz
 &END
 SUBSET_TYPE LIST
 ATOMS 1 3 5 6 8 9
 ALIGN_FRAMES T#对齐分子
 &END
 &END
```

上述是设置CV的例子，我用的7.2版本cp2k可设置28种类型的CV。CP2K_INPUT / FORCE_EVAL / SUBSYS / COLVAR，具体可以看官网关键词。

## 限制CV

很多时候需要对CV进行一些限制来达到模拟，这个步骤可以在MOTION模块完成：

```
&CONSTRAINT
  &COLLECTIVE
  COLVAR 1
  INTERMOLECULAR
  TARGET 5.
  TARGET_GROWTH 1.1
  TARGET_LIMIT 10.
 &END COLLECTIVE
&END CONSTRAINT

&COLLECTIVE
 TARGET [deg] 0.0
 MOLECULE 1
 COLVAR 2
 &RESTRAINT
 K [kcalmol] 4.90
 &END
&END COLLECTIVE
```

## mtd参数设置

mtd在MOTION模块下，加入&FREE_ENERGY就能开启自由能计算，包括alchemical change、mtd、umbrella integration等计算方法，下面用一个扩展拉格朗日元动力学例子：

```
&FREE_ENERGY
 &METADYN
 DO_HILLS T #生成高斯峰
 LAGRANGE #打开扩展拉格朗日方法
 NT_HILLS 40 #高斯峰生成频率
 SLOW_GROWTH #Let the last hill grow slowly over NT_HILLS
 TEMPERATURE 300 
 TEMP_TOL 100 #拉格朗日元动力学需要偏置温度及容差
 WW 0.0001 #高斯峰高度参数
 HILL_TAIL_CUTOFF 2 #防止高斯峰快速衰减
 P_EXPONENT 8 
 Q_EXPONENT 20 #截至函数指数部分参数，一般默认即可

 &METAVAR
 COLVAR 1  #指定CV
 SCALE 0.18 #峰宽
 LAMBDA 0.8 #在扩展拉格朗日方法中，为CV与系统坐标的耦合指定 lambda 参数
 MASS 20 #质量参数

 &WALL #扩展拉格朗日方法需要指定wall参数
 POSITION 2.0 #wall位置
 TYPE QUADRATIC #wall类型，可以指定高斯势、二次势、四次势和反射势
 &QUADRATIC #二次势参数
 DIRECTION WALL_PLUS 
 K 1.0 
 &END QUADRATIC 
 &END WALL
 &END METAVAR

&METAVAR 
 COLVAR 2 
 SCALE 0.22 
 LAMBDA 0.8 
 MASS 30 
 &END METAVAR

 &PRINT #输出设置
 &COLVAR 
 COMMON_ITERATION_LEVELS 3 #输出数据质量
 &EACH 
 MD 1 
 &END 
 &END 
 &HILLS 
 COMMON_ITERATION_LEVELS 3 
 &EACH 
 MD 1 
 &END 
 &END 
 &END 
 &END METADYN
&END FREE_ENERGY
```

以上就是cp2k完成metadynamics的参数设置例子，具体版本需要具体看手册关键词。
