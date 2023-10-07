
import React, { useContext, useState, useCallback, useRef, useEffect } from 'react';
import "./index.css"
import { setNeuronNetworkConfig, createNetwork, train, getDataFromModel, setNeuronNetworkNeuronInstance } from './Neuron.js';
import { Space, Table, Drawer, Form, Input, Button, message, Modal } from 'antd';
import { genComponentStyleHook } from 'antd/es/theme/internal';
import * as echarts from 'echarts';
import jsonData from './data';



const num = 20;
const paintBlockSize = 24;
const arr = Array(num).fill(0);
// 卷积核
const fristKernel = [
  [
    [0, -1, 1, 1],
    [1, 1, 0, 1],
    [0, 1, -1, 1],
    [0, 1, 1, -1]
  ],
  [
    [0, 0, -1, 0],
    [1, -1, 0, 1],
    [0, 1, 0, 1],
    [0, 0, -1, 0]
  ],
  [
    [1, 1, 1, 1],
    [-1, 0, 0, -1],
    [-1, 0, 0, -1],
    [1, 1, 1, 1]
  ],
  [
    [-1, 0, 1, 0],
    [0, -1, 0, 1],
    [1, 0, 1, 0],
    [0, 1, 0, -1]
  ],
  [
    [0, -1, 0, 1],
    [1, 0, 1, 0],
    [0, -1, 0, 1],
    [1, 0, -1, 0]
  ],
  [
    [0, 0, 0, 0],
    [1, -1, 1, 1],
    [0, 0, 0, 0],
    [1, -1, 1, -1]
  ],
  [
    [-1, 1, -1, 1],
    [1, -1, 1, -1],
    [-1, 1, -1, 1],
    [1, -1, 1, -1]
  ],
  [
    [1, 1, 0, -1],
    [0, -1, 0, 1],
    [-1, 0, 1, 0],
    [1, -1, 0, 1]
  ],
];
const poolSizeWidth = 4; // 这个值要求被 fristKernel 的长度整除
const poolSizeheight = 5;  // 这个值要求被 num*num 整除

window.W = []; // 权重矩阵
window.b = []; // 偏置向量
window.trainingSet = [];



const Paint = () => {

  // 数据
  const [trainSet, setTrainSet] = useState([]);
  const displayFeatureNum = useRef([]);
  const [inputValues, setInputValues] = useState([]); // 初始值为空字符串，可以根据需要调整
  const originData = useRef({});

  const [update, setUpdate] = useState(0);
  const [singleNum, setSingleNum] = useState(-1);
  const [isRecordTotalData, setIsRecordTotalData] = useState(true);


  const echartLine = useRef(null);
  const echartNetwork = useRef(null);

  const [layer, setLayer] = useState([90, 10, 10, 10]);
  const [lossObj, setLossObj] = useState([]);


  const setLossEchartOptions = (lossObj) => {
    console.log("lossObj", lossObj)
    // 绘制图表
    echartLine.current.setOption({
      xAxis: {
        type: 'category',
        data: lossObj.map((item, index) => index),
        // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          // data: [820, 932, 901, 934, 1290, 1330, 1320],
          data: lossObj,
          type: 'line',
          smooth: true
        }
      ]
    });
  }

  const setNetnorkEchartOptions = (neuronNetworkNeuronInstance) => {

    let oneNeuron = [];
    for (let i = 0; i < neuronNetworkNeuronInstance.length; i++) {
      for (let j = 0; j < neuronNetworkNeuronInstance[i].length; j++) {
        oneNeuron.push({
          name: i + '|' + j,
          x: 100 + 300 * j,
          y: 100 + 300 * i,
        })
      }
    }
    console.log("oneNeuron", oneNeuron)

    // 绘制图表
    echartNetwork.current.setOption({
      title: {
        text: '神经网络示意图'
      },
      tooltip: {},
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'none',
          symbolSize: 10,
          roam: true,
          label: {
            show: true
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          edgeLabel: {
            fontSize: 20
          },
          data: oneNeuron,
          // links: [],
          links: [
            {
              source: 'Node 1',
              target: 'Node 3'
            },
            {
              source: 'Node 2',
              target: 'Node 3'
            },
            {
              source: 'Node 2',
              target: 'Node 4'
            },
            {
              source: 'Node 1',
              target: 'Node 4'
            }
          ],
          lineStyle: {
            opacity: 0.9,
            width: 2,
            curveness: 0
          }
        }
      ]
    });
  }

  useEffect(() => {
    // 基于准备好的dom，初始化echarts实例
    echartLine.current = echarts.init(document.getElementById('loss'));
    // echartNetwork.current = echarts.init(document.getElementById('network'));
  });

  // 处理输入框值变化的函数
  const handleInputChange = (index, newValue) => {
    console.log("inputValues", inputValues)
    const newInputValues = [...inputValues];
    newInputValues[index] = newValue;
    setInputValues(newInputValues);
  };

  useEffect(() => {
    document.addEventListener("mousedown", function (event) {
      // 鼠标按下时的逻辑
      document.addEventListener("mousemove", handleMouseMove);
    });

    function handleMouseMove(event) {
      if (event.target.className === "paintId") {
        // 鼠标移动时的逻辑
        event.target.style.backgroundColor = "green";
        event.target.setAttribute("data-custom", "1");
      }
    }

    document.addEventListener("mouseup", function (event) {
      // 鼠标松开时的逻辑
      document.removeEventListener("mousemove", handleMouseMove);
    });
  }, []);

  // 矩阵运算
  function convolve(matrix, kernel) {
    // 获取矩阵和卷积核的尺寸
    const matrixSize = {
      rows: matrix.length,
      cols: matrix[0].length
    };

    const kernelSize = {
      rows: kernel.length,
      cols: kernel[0].length
    };

    let firstData = [];
    let secondData = [];
    let sum = 0;

    for (let x = 0; x < matrixSize.rows - kernelSize.rows; x++) {
      for (let y = 0; y < matrixSize.cols - kernelSize.cols; y++) {
        for (let x1 = 0; x1 < kernelSize.rows; x1++) {
          for (let y1 = 0; y1 < kernelSize.cols; y1++) {
            sum = sum + matrix[x + x1][y + y1] * kernel[x1][y1];
          }
        }
        secondData.push(sum);
        sum = 0;
      }

      firstData.push(JSON.parse(JSON.stringify(secondData)));
      secondData = [];
    }
    return firstData;
  }

  // 根据过滤器获取特征图
  const getSpecify = () => {
    const paintDom = document.getElementsByClassName("paintId");
    let firstData = [];
    let secondData = [];
    let index = 0;
    for (let i = 0; i < num * num; i++) {
      let value = parseInt(paintDom[i].getAttribute("data-custom"));
      if (index < num && i !== 2499) {
        index = index + 1;
        secondData.push(value);
      } else if (i === 2499) {
        secondData.push(value);
        firstData.push(secondData);
      } else {
        firstData.push(secondData);
        secondData = [value];
        index = 1;
      }
    }

    let firstConvolve = [];
    fristKernel.map((kernel) => {
      firstConvolve.push(convolve(firstData, kernel));
    });
    return firstConvolve;
  }

  // 过滤器
  const filter = (firstConvolve) => {
    const stackedFeatureMaps = [];
    // 遍历每个位置，并将每个过滤器的输出添加到堆叠数组中
    for (let i = 0; i < firstConvolve[0].length; i++) {
      for (let j = 0; j < firstConvolve[0].length; j++) {
        const stack = [];
        for (let z = 0; z < firstConvolve.length; z++) {
          stack.push(firstConvolve[z][i][j]);
        }
        stackedFeatureMaps.push(stack);
      }
    }
    return stackedFeatureMaps;
  }

  // 非线性转换
  const transformUnLine = (matrix) => {
    // 创建一个新的矩阵用于存储结果
    let result = [];
    for (let i = 0; i < matrix.length; i++) {
      let row = matrix[i];
      let newRow = [];
      for (let j = 0; j < row.length; j++) {
        // 对每个元素应用 ReLU 函数
        newRow.push(Math.max(0, row[j]));
      }
      result.push(newRow);
    }
    return result;
  }

  // 池化 - 减少特征值，加快运算速度
  const maxPooling = (featureMap) => {
    let pooledMap = [];
    // 确保特征图的大小可以被池化窗口整除
    if (featureMap.length % poolSizeheight !== 0 || featureMap[0].length % poolSizeWidth !== 0) {
      throw new Error('特征图的大小必须能被池化窗口大小整除');
    }

    for (let i = 0; i < featureMap.length; i += poolSizeheight) {
      let pooledRow = [];
      for (let j = 0; j < featureMap[0].length; j += poolSizeWidth) {
        let pool = [];
        // 从特征图中获取池化窗口
        for (let i1 = 0; i1 < poolSizeheight; i1++) {
          for (let j1 = 0; j1 < poolSizeWidth; j1++) {
            pool.push(featureMap[i + i1][j + j1]);
          }
        }
        // 找到池化窗口中的最大值，并添加到池化后的特征图中
        pooledRow.push(Math.max(...pool));
      }
      pooledMap.push(pooledRow);
    }

    return pooledMap;
  }

  const getSpecifyData = () => {
    let firstConvolve = getSpecify();
    // console.log('得到所有特征图', firstConvolve);

    let stackedFeatureMaps = filter(firstConvolve);
    // console.log('堆叠后的特征函数:', stackedFeatureMaps);

    let transformedFeatureMaps = transformUnLine(stackedFeatureMaps);
    // console.log("非线性变化:", transformedFeatureMaps);

    let maxPoolingData = maxPooling(transformedFeatureMaps);
    // console.log("池化操作:", maxPoolingData);

    let oneLevelData = maxPoolingData.flat();
    // console.log("扁平化操作:", oneLevelData);

    return oneLevelData;
  }

  const submit = () => {

    let oneLevelData = getSpecifyData();
    let tmpTrainSet = [...trainSet, oneLevelData];

    displayFeatureNum.current = [];
    tmpTrainSet.map((oneArr, index1) => {
      displayFeatureNum.current.push([]);
      oneArr.map((num) => {
        displayFeatureNum.current[index1].push({
          isSameFeature: 0,
          num: num
        });
      });
    });
    inputValues.push("");
    setInputValues([...inputValues]);
    setTrainSet(tmpTrainSet);
    clear();

  }

  const clear = () => {
    let collection = document.getElementsByClassName("paintId");
    for (let i = 0; i < collection.length; i++) {
      const element = collection[i];
      // 在这里对元素执行操作
      element.style.backgroundColor = "red";
      element.setAttribute("data-custom", "0");
    }
  }

  const displayFeature = () => {
    if (trainSet.length === 0) {
      return;
    }
    for (let hang = 0; hang < trainSet[0].length; hang++) {
      let lieArr = []
      for (let lie = 0; lie < trainSet.length; lie++) {
        lieArr.push(trainSet[lie][hang]);
      }

      let { mostCommonNumber, count } = findMostCommonNumberWithCount(lieArr);
      for (let lie = 0; lie < trainSet.length; lie++) {
        if ('' + trainSet[lie][hang] === mostCommonNumber) {
          displayFeatureNum.current[lie][hang].isSameFeature = count / trainSet.length;
        }
      }
    }
    setUpdate(update + 1);
  }

  function findMostCommonNumberWithCount(arr) {
    // 创建一个对象来存储数字和对应的出现次数
    const countMap = {};

    // 遍历数组，统计每个数字的出现次数
    for (const num of arr) {
      if (countMap[num]) {
        countMap[num]++;
      } else {
        countMap[num] = 1;
      }
    }

    let mostCommonNumber = null;
    let maxCount = 0;

    // 遍历计数对象，找到出现次数最多的数字和对应的个数
    for (const num in countMap) {
      if (countMap[num] > maxCount) {
        mostCommonNumber = num;
        maxCount = countMap[num];
      }
    }

    return {
      mostCommonNumber: mostCommonNumber,
      count: maxCount
    };
  }

  const getColor = (num) => {
    let colors = ['#e9e9e9', '#e0a9a9', '#dd6e6e', '#dc3f3f', '#da0000'];
    if (num <= 0.2) {
      return colors[0];
    } else if (num <= 0.4) {
      return colors[1];
    } else if (num <= 0.6) {
      return colors[2];
    } else if (num <= 0.8) {
      return colors[3];
    } else {
      return colors[4];
    }
  }

  const remove = (index) => {
    displayFeatureNum.current.splice(index, 1);
    trainSet.splice(index, 1);
    inputValues.splice(index, 1);
    setTrainSet([...trainSet]);
    setInputValues([...inputValues]);
  }

  const reduce = (index) => {
    if (index === 0) return;
    layer[index] = layer[index] - 1;
    setLayer([...layer]);
  }

  const add = (index) => {
    if (index === 0) return;
    layer[index] = layer[index] + 1;
    setLayer([...layer]);
  }

  const addLayer = () => {
    layer.splice(layer.length - 1, 0, 7);
    setLayer([...layer]);
  }

  const trainData = () => {
    setNeuronNetworkNeuronInstance([]);
    setNeuronNetworkConfig(layer);
    createNetwork();
    let true_data = [];
    trainSet.map((item, index) => {
      let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      arr[inputValues[index]] = 1
      true_data.push(arr)
    });
    console.log("================开始训练==================")
    console.log("trainSet", trainSet)
    console.log("true_data", true_data)
    train(
      trainSet,
      true_data,
      (loss) => {
        lossObj.push(loss);
        console.log("loss", loss);
        setLossObj([...lossObj])
        setLossEchartOptions(lossObj)
      },
      // callBackFinish
      (neuronNetworkNeuronInstance) => {
        // setNetnorkEchartOptions(neuronNetworkNeuronInstance);
      }
    );
  }

  const getResult = () => {
    let oneLevelData = getSpecifyData();
    let data = getDataFromModel(oneLevelData);
    console.log(data);
    let maxRate = 0;
    let indexMax = 0;
    data.map((rate, index) => {
      if (rate > maxRate) {
        maxRate = rate;
        indexMax = index;
      }
    })
    Modal.info({
      title: 'This is a notification message',
      content: (
        <div>
          {data.map((rate, index) => {
            return (
              <div style={{ display: 'flex', fontSize: 32, color: indexMax === index ? 'red' : 'black' }}>
                <div style={{ marginRight: 20 }}>{index}</div>
                <div>{((rate.toFixed(6) * 100) + '').slice(0, 5)}%</div>
              </div>
            )
          })}
        </div>
      ),
      onOk() { },
    });
  }

  const localStorageData = () => {
    let preds_data = []

    if (localStorage.getItem('dataSetAndPreds')) {
      let data = localStorage.getItem('dataSetAndPreds');
      preds_data = JSON.parse(data);
    }

    trainSet.map((item, index) => {
      let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      arr[inputValues[index]] = 1
      preds_data.push({
        dataSet: item,
        preds: arr
      });
    });
    localStorage.setItem('dataSetAndPreds', JSON.stringify(preds_data));
  }

  const getStorageData = () => {
    let preds_data = [];

    if (localStorage.getItem('dataSetAndPreds')) {
      let data = localStorage.getItem('dataSetAndPreds');
      preds_data = JSON.parse(data);
    } else {
      alert("暂无数据")
    }
    console.log("preds_data", preds_data)
    let index1 = displayFeatureNum.current.length;
    preds_data.map((obj) => {
      let { dataSet, preds } = obj;
      trainSet.push(dataSet);
      let pred0_9 = 0;
      preds.filter((pred, index) => {
        if (pred === 1) {
          pred0_9 = index
        }
      })
      inputValues.push(pred0_9);
      displayFeatureNum.current.push([]);
      dataSet.map((num) => {
        displayFeatureNum.current[index1].push({
          isSameFeature: 0,
          num: num
        });
      });
      index1 = index1 + 1;
    })
    console.log("inputValues1111", JSON.parse(JSON.stringify(inputValues)));
    setTrainSet(trainSet);
    setInputValues(JSON.parse(JSON.stringify(inputValues)));

  }

  const copyAllInStorageData = () => {
    let preds_data = []
    trainSet.map((item, index) => {
      let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      arr[inputValues[index]] = 1
      preds_data.push({
        dataSet: item,
        preds: arr
      });
    });
    localStorage.setItem('dataSetAndPreds', JSON.stringify(preds_data));
  }

  const shuffleArray = () => {
    for (let i = inputValues.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [inputValues[i], inputValues[j]] = [inputValues[j], inputValues[i]];
      [displayFeatureNum.current[i], displayFeatureNum.current[j]] = [displayFeatureNum.current[j], displayFeatureNum.current[i]];
      [trainSet[i], trainSet[j]] = [trainSet[j], trainSet[i]];
    }
    setTrainSet([...trainSet]);
    setInputValues([...inputValues]);
  }

  useEffect(() => {
    if (isRecordTotalData) {
      originData.current.inputValues = JSON.parse(JSON.stringify(inputValues));
      originData.current.trainSet = JSON.parse(JSON.stringify(trainSet));
      originData.current.displayFeatureNum = JSON.parse(JSON.stringify(displayFeatureNum.current));
    }
    setIsRecordTotalData(true);
  }, [inputValues.length, trainSet.length, displayFeatureNum.current.length]);

  const getJsonData = () => {
    console.log("|jsonData", jsonData)
    jsonData.map((obj) => {
      trainSet.push(obj.dataSet);
      displayFeatureNum.current.push([])
      let predsIndex = 0;
      obj.preds.map((predItem, index) => {
        if (predItem === 1) {
          predsIndex = index;
        }
      });
      obj.dataSet.map((num) => {
        displayFeatureNum.current[displayFeatureNum.current.length - 1].push({
          isSameFeature: 0,
          num: num
        });
      });

      inputValues.push(predsIndex);
    });
    setTrainSet([...trainSet]);
  }

  return (
    <div style={{ overflowY: "scroll", height: 900 }}>
      <div style={{ display: 'flex' }}>
        <div>
          {
            arr.map((t, x) => {
              return (
                <div style={{ display: 'flex' }}>
                  {
                    arr.map((t, y) => {
                      return <div class="paintId" style={{ width: paintBlockSize, height: paintBlockSize, backgroundColor: 'red' }} data-custom={"0"}></div>
                    })
                  }
                </div>
              )
            })
          }
          <div style={{ width: 500 }}>
            <button onClick={() => submit()}>提交图像</button>
            <button onClick={() => clear()}>清除图像</button>
            <button onClick={() => displayFeature()}>提取特征</button>
            <button onClick={() => addLayer()}>添加层数</button>
            <button onClick={() => trainData()}>开始训练</button>
            <button onClick={() => getResult()}>查看训练结果</button>
            <button onClick={() => shuffleArray()}>随机排列集合</button>
            <button onClick={() => localStorageData()}>添加缓存不覆盖</button>
            <button onClick={() => getStorageData()}>提取缓存</button>
            <button onClick={() => getJsonData()}>提取json</button>
            <button onClick={() => copyAllInStorageData()}>覆盖缓存</button>
          </div>
        </div>
        <div style={{ height: 500, overflowY: "scroll" }}>
          {
            displayFeatureNum.current.map((singleData, index1) => {
              return <div key={index1} style={{ display: 'flex' }}>
                {
                  singleData.map((feature, index2) => {
                    return <div key={index2} style={{ border: '1px solid black', width: 10, backgroundColor: feature.isSameFeature > 0 ? getColor(feature.isSameFeature) : "white" }}>{feature.num}</div>
                  })
                }
                <ListItem
                  key={Math.random()}
                  value={inputValues[index1]}
                  onChange={(event) => handleInputChange(index1, event.target.value)}
                />
                <button onClick={() => remove(index1)} style={{ width: 80 }}>删除</button>
              </div>
            })
          }
        </div>

      </div>

      <div id="container" style={{ width: "100%", display: "flex", justifyContent: "space-around", flexDirection: 'column', marginTop: 30, width: 1920 }}>
        {
          layer.map((singleLayer, index) => {
            let domList = [];
            for (let index = 0; index < singleLayer; index++) {
              domList.push(
                <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'gray', margin: "0 2px" }}></div>
              )
            }
            return (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: "30px 0", position: "relative" }}>
                {domList.map((dom) => dom)}
                <div style={{ position: 'relative', right: -20, width: 0 }}>
                  <div style={{ position: 'absolute', width: 100, top: -12 }}>
                    {index !== 0 && index !== layer.length - 1 ? <button onClick={() => reduce(index)}>-</button> : ""}
                    {index !== 0 && index !== layer.length - 1 ? <button onClick={() => add(index)}>+</button> : ""}
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>

      <div>
        <div id="loss" style={{ width: '100%', height: 500 }}></div>
      </div>


      {/* <div style={{ border: '1px solid' }}>
        <div id="network" style={{ width: '100%', height: 777 }}></div>
      </div> */}
      <LossMethods />

    </div>
  )
}

// 子组件，表示每个列表项
const ListItem = ({ value, onChange }) => {
  return (
    <div>
      <input type="text" value={value} onChange={onChange} style={{ width: 77 }} />
    </div>
  );
};


const LossMethods = () => {

  let dotList_y = useRef([]);
  let dotList_x_y = useRef([]);
  const [update, setUpdate] = useState(0);

  const oneMethods = () => {
    dotList_x_y.current = [];
    dotList_y.current = [];
    let k1 = getRandomNonZeroDecimalInRange(1, 10);
    let k2 = getRandomNonZeroDecimalInRange(-10, 0);
    let k3 = getRandomNonZeroDecimalInRange(0, 40);
    let k4 = getRandomNonZeroDecimalInRange(-40, -30);
    let k5 = getRandomNonZeroDecimalInRange(-2, 2);
    let b1 = getRandomNonZeroDecimalInRange(-10, 10);
    let b2 = getRandomNonZeroDecimalInRange(-10, 10);
    let b3 = getRandomNonZeroDecimalInRange(-10, 10);
    let b4 = getRandomNonZeroDecimalInRange(-10, 10);
    let b5 = getRandomNonZeroDecimalInRange(-10, 10);
    for (let x = -500; x < 500; x++) {
      // 每个x运行五次
      let y1 = k1 * x + b1;
      let y2 = k2 * y1 + b2;
      let y3 = k3 * y2 + b3;
      let y4 = k4 * y3 + b4;
      let y5 = k5 * y4 + b5;
      dotList_y.current.push(y5);
    }
    dotList_y.current = compressArrayToRange(dotList_y.current, 0, 500);
    dotList_y.current.map((y, index) => {
      dotList_x_y.current.push({
        x: index * 2,
        y: y
      })
    })

    console.log("dotList_x_y.current", dotList_x_y.current)
    setUpdate(update + 1);
  }



  const twoMethods = () => {
    dotList_x_y.current = [];
    dotList_y.current = [];
    let k1 = getRandomNonZeroDecimalInRange(1, 2);
    let k2 = getRandomNonZeroDecimalInRange(-1, 0);
    let k3 = getRandomNonZeroDecimalInRange(20, 40);
    let k4 = getRandomNonZeroDecimalInRange(-10, 0);
    let k5 = getRandomNonZeroDecimalInRange(-2, 2);
    let b1 = getRandomNonZeroDecimalInRange(-10, 10);
    let b2 = getRandomNonZeroDecimalInRange(-10, 10);
    let b3 = getRandomNonZeroDecimalInRange(-10, 10);
    let b4 = getRandomNonZeroDecimalInRange(-10, 10);
    let b5 = getRandomNonZeroDecimalInRange(-10, 10);
    for (let x = -500; x < 500; x++) {
      // 每个x运行五次
      let y1 = swish(k1 * x + b1);
      let y2 = swish(k2 * y1 + b2);
      let y3 = sigmoid(k3 * y2 + b3);
      let y4 = sigmoid(k4 * y3 + b4);
      let y5 = isru(k5 * y4 + b5, 2);
      dotList_y.current.push(y5);
    }
    dotList_y.current = compressArrayToRange(dotList_y.current, 0, 500);
    dotList_y.current.map((y, index) => {
      dotList_x_y.current.push({
        x: index * 2,
        y: y
      })
    })

    console.log("dotList_x_y.current", dotList_x_y.current)
    setUpdate(update + 1);
  }
  function getRandomNonZeroDecimalInRange(min, max) {
    if (min >= max) {
      throw new Error("最小值必须小于最大值");
    }

    let randomNum;
    do {
      randomNum = Math.random() * (max - min) + min;
    } while (randomNum === 0);

    return Number(randomNum.toFixed(2));
  }

  function compressArrayToRange(arr, newMin, newMax) {
    const min = Math.min(...arr);
    const max = Math.max(...arr);

    const mappedArr = arr.map(num => {
      const mappedNum = ((num - min) / (max - min)) * (newMax - newMin) + newMin;
      return mappedNum;
    });

    return mappedArr;
  }

  function swish(x) {
    return x * sigmoid(x);
  }

  function isru(x, alpha) {
    return x / Math.sqrt(1 + alpha * x * x);
  }

  function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }


  return (
    <div>
      <button onClick={() => oneMethods()}>y=kx+b</button>
      <button style={{ marginLeft: 20 }} onClick={() => twoMethods()}>激活函数</button>
      <div style={{ width: '100%', height: 600, backgroundColor: 'red', position: 'relative', overflow: 'hidden' }}>
        {
          dotList_x_y.current.map(({ x, y }, index) => {
            return <div style={{ position: 'absolute', width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'blue', bottom: y + 'px', left: x + 'px' }}></div>
          })
        }
      </div>
    </div>
  );
};

export default Paint;