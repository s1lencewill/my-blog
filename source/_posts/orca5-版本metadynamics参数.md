---
title: orca5.0版本metadynamics参数
date: 2022-05-30 18:35:00
tags: [ORCA, Metadynamics, 计算化学]
categories: 计算化学
---

2021年7月1日，量子化学程序ORCA 5.0发布,动力学模块增加了metadynamics获得自由能面。集合变量可以用距离、角度、二面角、配位数，还可以加谐振或高斯限制势。这里解读一下手册对metadynamics部分的参数描述。

## aimd命令列表

metadynamics相关的两个命令是Manage_Colvar和Metadynamics，前者用来定义CV后者用来描述运行参数。

## Manage_Colvar

定义用于元动力学或对系统施加约束的集合变量（"Colvars"）。在一般意义上，Colvar只是返回实数的所有原子位置的连续函数。由于Colvars本身对模拟没有任何影响，因此目前只能对其进行定义或重新定义；没有删除它们的要求。

Colvar命令的第二个参数是Colvar的编号。此数字稍后用于定位Colvar。如果以前定义的Colvar编号再次定义，则只需覆盖它。

第三个强制参数是Colvar的类型，可以是距离、角度、二面体和配位数数。

比如说集合变量为两个原子之间的距离：

```
Colvar Define 1 Distance Atom 0 Atom 7
```

就可以了。除了距离、角度之外，还支持原子分组并加权重的CV，比如：

```
Colvar Define 2 Distance Atom 0 Group 1 2 3 Weights 1.0 1.0 1.0
```

这表示0号原子与一组原子间的距离，权重都为1.0。

定义配位数的话就是：

```
Colvar Define 3 CoordNumber Atom 0 Group 1..10 Cutoff 200_pm
```

表示0号原子与1~10号原子的配位数，截断距离是200pm。

后续会支持更多类型的CV定义，有需要可以去官方论坛反馈 https://orcaforum.kofo.mpg.de （需要科学上网）。

## Metadynamics命令模块和参数类型

以上是metadynamics的主命令，这些参数可以在对Metadynamics命令的单个调用中设置，也可以分布在多个此类调用中，以避免出现很长的行。在这两种情况下，参数设置的顺序都有一些规则。在设置任何其他参数之前，需要指定Metadynamics的所有Colvars。与Colvar相关的修改器（例如"scale"、"wall"和"range"）仅应用于在Metadynamics命令中在其前面最后指定的Colvar。

### 【scale】

Colvars可以有不同的物理单位，例如距离的埃和角度的度。在多维元动力学运行中，相应数字的不同数值大小可能是一个问题：角度跨越180度的范围，而距离通常仅在10埃的间隔内。为了使所有Colvar具有相似的规模，Metadynamics模块将每个Colvar内部除以用户提供的常量。这些内部值是无量纲的，它们将被称为"scale"。对于以前指定的Colvar，可以通过缩放修改器设置缩放常量。它需要一个实数参数，必须以Colvar的物理单位指定（距离Colvars的长度单位，角度和二面体Colvars的角度单位）。坐标数Colvars无论如何都是无量纲的。如果未指定，则使用合理的比例默认值，距离Colvars为1.0埃，角度和二面体Colvars为20.0度，坐标数Colvars为0.2。

### 【wall】

为了在元动力学模拟期间将Colvars保持在感兴趣的区域内，可以在Colvars上施加谐波墙。这是通过wall实现的。第一个参数，它指墙的方向，可以是较低的，也可以是较高的。第二个参数是这堵墙的位置——以Colvar的物理单位（例如，距离Colvar为埃）给出，而不是以比例单位给出。作为可选的第三个实数参数，谐波墙的弹簧常数可以用 $KJ\bullet mol^{-1}\bullet unit^{-2}$ ，其中unit是Colvar的默认物理单位（距离为埃，角度为度）。如果省略，弹簧常数默认为 $50 KJ\bullet mol^{-1}\bullet unit^{-2}$ 。可以定义上下限，例如在"Metadynamics Colvar 1 Wall Lower 3.0_A 50.0 Upper 10.0_A 50.0"中。请注意，也可以通过约束命令将单侧谐波墙施加到Colvars上。对于标准元动力学，wall的定义是多余的。然而，对于扩展的拉格朗日元动力学，元动力学命令中定义的wall直接作用于虚拟粒子。

### 【range】

应用于Colvars的最后一个设置是range修改器。它对元动力学运行本身没有影响，只控制自由能剖面的输出。range需要三个参数。前两个必须是实数，并定义区间下限和上限，对于该边界，应输出关于该Colvar的自由能剖面。第三个参数是整数类型，控制要为此间隔生成的网格点的数量。

### 【HillSpawn】

通过HillSpawn修改器控制向偏置势添加高斯峰。它需要三个参数。第一个参数必须是整数类型，并定义高斯峰产生频率，即每增加多少MD步（通常每10–50 fs）就添加一个新高斯峰。第二个参数是实数，以 $KJ\bullet mol^{-1}$ 为单位指定每个新高斯峰的高度（通常为0.1–1.0） 。第三个参数以"比例单位"设置高斯峰的宽度σ（这是标准偏差，而不是方差）。在二维元动力学模拟中，宽度同时适用于两个维度，需要调整两个Colvars的比例，以获得正确的高斯峰宽度"纵横比"，σ的标准选择为0.1–1.0标度单位。

### 【store】

控制当前中间自由能剖面保存到磁盘的频率。它需要一个整数参数，指定两个这样的存储之间的MD模拟时间步数。对于二维Metadynamics，会编写文件名为"basename-metadynamics_2d_profile_###.gp"的Gnuplot源文件，可以使用免费软件工具Gnuplot（在Windows和GNU Linux上运行）将其转换为等高线图。这些等高线图的原始数据可以在名为"basename-metadynamics_2d_profile_###.gp.csv"的相应文件中找到。

### 【Welltempered】

打开well-tempered Metadynamics。与标准元动力学相比，自由能分布在这种方法的长期运行中趋于极限值。这种方法在之前已经产生了许多高斯峰的位置，缩小峰的大小，以便随着时间的推移，偏置势能的变化变得更小（收敛）。Well-tempered需要一个实数参数，即所谓的偏置温度，以温度单位指定。偏置温度的选择应确保 $\frac{1}{2}\bullet \kappa_{b} \bullet T_{bias}$ 的大小与模拟应克服的最大势垒的大小大致相同。例如，12000 K的偏置温度非常适合克服大约100 kJ/mol的势垒。

### 【Lagrange】

打开扩展的拉格朗日元动力学。这个方法具体参见 Iannuzzi, M.; Laio, A.; Parrinello, M. (2003) Phys. Rev. Lett., 90, 238302.
