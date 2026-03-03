---
title: 如何在CP2K实现Metadynamics模拟
date: 2022-09-20 15:30:00
tags: [CP2K, Metadynamics, AIMD, 计算化学]
categories: 计算化学
---

这里使用cp2k官网的例子，说明一下MtD在cp2k中的实现。这个例子是两个HNO3分子在石墨烯片上的解离动力学。

首先要会使用cp2k做正常的的AIMD，MtD只是在正常的NVT系综的AIMD中添加相应的关键词即可。

## 初始结构

第一部分是正常的AIMD的输入文件：包含结构、方法、泛函、任务类型、输出信息和重启文件等等。

```
&FORCE_EVAL
  METHOD Quickstep

@IF ( ${METHOD_TO_USE} == DFT )
  &DFT
      BASIS_SET_FILE_NAME  ${LIBPATH}/BASIS_MOLOPT
      POTENTIAL_FILE_NAME  ${LIBPATH}/GTH_POTENTIALS
    &MGRID
      NGRIDS 5
      CUTOFF 200
    &END MGRID
    &QS
      METHOD GPW
      MAP_CONSISTENT
      EXTRAPOLATION ASPC
      EXTRAPOLATION_ORDER 3
    &END QS

    &SCF
      MAX_SCF 30
      EPS_SCF 1.0E-5
      SCF_GUESS ATOMIC
      &OT
        PRECONDITIONER FULL_SINGLE_INVERSE
        MINIMIZER DIIS
        N_DIIS 7
      &END OT

      &OUTER_SCF
        MAX_SCF 3
        EPS_SCF 1.0E-05
      &END OUTER_SCF

      &PRINT
        &RESTART
          LOG_PRINT_KEY
        &END
      &END
     &END SCF

     &XC
        &XC_FUNCTIONAL REVPBE
        &END XC_FUNCTIONAL
        &vdW_POTENTIAL
           DISPERSION_FUNCTIONAL PAIR_POTENTIAL
           &PAIR_POTENTIAL
              TYPE DFTD2
              SCALING  1.0
              R_CUTOFF  [angstrom] 16
           &END PAIR_POTENTIAL
        &END vdW_POTENTIAL
     &END XC

  &END DFT
@ENDIF

@IF ( ${METHOD_TO_USE} == SE )
  &DFT
    CHARGE 0
    &QS
      METHOD PM6
      &SE
       RC_INTERACTION [angstrom] 8.0
       RC_COULOMB     [angstrom] 8.0
       RC_RANGE       [angstrom] 0.05
      &END
    &END QS
    &SCF
      MAX_SCF 30
      EPS_SCF 1.0E-5
      SCF_GUESS ATOMIC
      &OT 
        MINIMIZER DIIS
        PRECONDITIONER FULL_SINGLE_INVERSE
      &END
      &OUTER_SCF
        EPS_SCF 1.0E-5
        MAX_SCF 5
      &END
      &PRINT
        &RESTART OFF
        &END
        &RESTART_HISTORY OFF
        &END
      &END
    &END SCF
  &END DFT
@ENDIF

@IF ( ${METHOD_TO_USE} == DFTB )
  &DFT
    &QS
      METHOD DFTB
      &DFTB
        SELF_CONSISTENT    T
        DO_EWALD           T
        DISPERSION         T
        &PARAMETER
          PARAM_FILE_PATH  ${LIBPATH}/scc
          PARAM_FILE_NAME  scc_parameter
          UFF_FORCE_FIELD  uff_table
        &END PARAMETER
      &END DFTB
    &END QS
    &SCF
      MAX_SCF 30
      EPS_SCF 1.0E-6
      SCF_GUESS ATOMIC
      &OT
        MINIMIZER DIIS
        PRECONDITIONER FULL_SINGLE_INVERSE
      &END
      &OUTER_SCF
        EPS_SCF 1.0E-6
        MAX_SCF 5
      &END
      &PRINT
        &RESTART OFF
        &END
        &RESTART_HISTORY OFF
        &END
      &END
    &END SCF
    &POISSON
      PERIODIC XYZ
      &EWALD
       EWALD_TYPE SPME
       GMAX 25
       O_SPLINE 5
      &END EWALD
    &END POISSON
  &END DFT
@ENDIF

  &SUBSYS
    &CELL
      ABC   12.30000  12.78000 20.0
      PERIODIC XYZ
    &END CELL

    &TOPOLOGY
      CONNECTIVITY  OFF
      COORD_FILE ${XYZPATH}/grly5x3_2hno3.xyz
      COORDINATE XYZ
    &END TOPOLOGY

    &KIND C
      BASIS_SET DZVP-MOLOPT-GTH
      POTENTIAL GTH-BLYP-q4
    &END KIND

    &KIND H
      BASIS_SET DZVP-MOLOPT-GTH
      POTENTIAL GTH-BLYP-q1
    &END KIND

    &KIND O
      BASIS_SET DZVP-MOLOPT-GTH
      POTENTIAL GTH-BLYP-q6
    &END KIND

    &KIND N
      BASIS_SET DZVP-MOLOPT-GTH
      POTENTIAL GTH-BLYP-q5
    &END KIND

  &END SUBSYS
&END FORCE_EVAL

&GLOBAL
  PROJECT gr2hno3_nvt
  RUN_TYPE MD
  PRINT_LEVEL LOW
&END GLOBAL

&MOTION
  &MD
    ENSEMBLE NVT
    STEPS  50000
    TIMESTEP 1.0
    TEMPERATURE 300.0
    TEMP_TOL   100
    &THERMOSTAT
      &NOSE
        LENGTH 3
        YOSHIDA 3
        TIMECON 100.0
        MTS 2
      &END NOSE
    &END
    ANGVEL_ZERO
    COMVEL_TOL  2.0E-7

    &PRINT
      &ENERGY
        &EACH
           MD 10
        &END
      &END

      &PROGRAM_RUN_INFO
        &EACH
           MD 100
        &END
      &END
      FORCE_LAST
    &END PRINT
  &END MD

  &PRINT
    &TRAJECTORY
      &EACH
        MD 100
      &END
    &END
    &VELOCITIES OFF
    &END
    &RESTART
      &EACH
         MD 1000
      &END
      ADD_LAST NUMERIC
    &END
    &RESTART_HISTORY 
      &EACH
         MD 2000
      &END
    &END
  &END
  &CONSTRAINT
    &FIXED_ATOMS
      LIST    48 51 54 57 60 45 59 44 58 43
    &END
  &END
&END MOTION
```

## 添加外部限制

但实际上，正常的AIMD很难观察到解离过程，需要很长的运行时间。上述文件使用的方法是半经验方法，经测试可以运行，但是NHO3分子很容易跑出石墨烯范围，所以有必要添加限制：

```
&EXTERNAL_POTENTIAL
     ATOMS_LIST   61..70
     FUNCTION   0.000000000001*(Z^2)^4
  &END

  &EXTERNAL_POTENTIAL
     ATOMS_LIST   61..70
     FUNCTION   0.0000000000001*(X^2)^4
  &END

  &EXTERNAL_POTENTIAL
     ATOMS_LIST   61..70
     FUNCTION   0.0000000000001*(Y^2)^4
  &END
```

上述定义一个以系统坐标中心为中心的球势，它只作用于两个分子。

## 集合变量(CV)的选择

正常的AIMD可以运行之后，说明其他设置是没有问题的，就可以着手MtD的构建。

首先要思考自己的体系或者关心的问题适合以什么样的集合变量（CV）来描述反应坐标，键长、键角、配位数等等。

这个体系中，NHO3解离生成NO2和OH最显著的变化就是N-O，但是没法确定是否发生分子间或者分子内的H转移，实际上键长变化是无法精准确定的，所以使用N-O配位数来作为反应坐标是比较合适的。

其次，考虑到石墨烯的影响，吸附或者非吸附解离是无法确定并且吸附点位也无法精确确定，所以使用C-O的配位数可以区分是否吸附，C-H的配位可以确定NO2还是OH更容易吸附。

最终使用三个配位数来作为反应坐标：

```
&COLVAR
   &COORDINATION
      KINDS_FROM  O
      KINDS_TO   C
      R_0 [angstrom]  1.8
      NN  8
      ND  14
   &END COORDINATION
&END COLVAR

&COLVAR
   &COORDINATION
      KINDS_FROM  N
      KINDS_TO   O
      R_0 [angstrom]  1.8
      NN  8 
      ND  14
   &END COORDINATION
&END COLVAR

&COLVAR
   &COORDINATION
      KINDS_FROM  H
      KINDS_TO   C
      R_0 [angstrom]  1.6
      NN  8
      ND  14
   &END COORDINATION
&END COLVAR
```

这里配位数公式是：n和m对应参数NN和ND、r0对应R_0

这个公式是使用统计的接触距离数作为配位数的近似，NN和ND参数是为了让函数连续可导，因为偏置势必然要对集合变量产生作用力，计算化学中显著变量是原子坐标R，确定集合变量（CV）既要能对体系过程进行描述，又要是坐标R的连续可导函数。

## 激活MtD算法

集合变量的设置添加进 &SUBSYS 模块即可。接下来是激活MtD算法：

```
&METADYN
      DO_HILLS 
      NT_HILLS 100
      WW 3.0e-3

      &METAVAR
        SCALE 0.2
        COLVAR 1
      &END METAVAR

      &METAVAR
        SCALE 0.3
        COLVAR 2
      &END METAVAR

     &METAVAR
        SCALE 0.2
        COLVAR 3
      &END METAVAR

      &PRINT
        &COLVAR
           COMMON_ITERATION_LEVELS 3
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
```

其中必要的参数：
- **NT_HILLS** 是高斯波产生时间步长
- **WW** 是波高
- **SCALE** 是波宽，但是必须指定CV，就是说不同CV波宽是可以不一致的

&PRINT下的&COLVAR和 &HILLS是输出CV和高斯峰的信息。

以上部分必须添加到&MOTION的&FREE_ENERGY 部分。

## 结果分析

运行100ps之后，我们可以额外得到COLVAR.metadynLog和HILLS.metadynLog文件，包含了CV和高斯峰的信息。

使用COLVAR.metadynLog文件作图可以得到CV随时间变化的图像来判断采样情况：

HILLS.metadynLog可以获得多维自由能面：CV1和CV2的2维自由能面。

其实cp2k自带自由能面的后处理工具：graph.popt，可以使用XXX.restart文件获得fes.dat,包含了CV和自由能数据方便绘图。

运行和cp2k一样：

```
graph.popt -i -ndim 3 -ndw 1 2 -file XXX.restart -cp2k -o COF_GAPW.out
```

- nd dim是CV总维度数
- ndw是需要绘制的CV编号：1 2 代表CV1和CV2
