
import React, { useContext, useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { Space, Table, Drawer, Form, Input, Button, message } from 'antd';
import Item from 'antd/es/list/Item';
const { Search } = Input;
const { TextArea } = Input;


const num = 20;
const paintBlockSize = 24;
const arr = Array(num).fill(0);
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
const poolSizeWidth = 4; // 这个值要求被fristKernel的长度整除
const poolSizeheight = 5;  // 这个值要求被num*num整除

const n = 90; // 输入特征的维度
const m = 10; // 输出特征的维度
window.W = []; // 权重矩阵
window.b = []; // 偏置向量
window.trainingSet = [];

const requestData = async (oneLevelData) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "strArr": oneLevelData
    })
  };
  fetch('/strArr', requestOptions);
}

const getData = async () => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return await fetch('/getStrArr', requestOptions);
}

function relu(x) {
  return Math.max(0, x);
}

const Paint = () => {

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

  useEffect(() => {
    const get = async () => {
      let res = await getData();
      let actualData = await res.json();
      console.log('actualData = ', actualData);
      let trainingSet = actualData.map((item, index) => {
        if (item) {
          return {
            features: JSON.parse(item), label: 7
          }
        }
      });
      console.log("trainingSet", trainingSet);
      window.trainingSet = trainingSet;
    }
    get();
  });

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
            sum = sum + matrix[x + x1][y + y1] * kernel[x1][y1]
          }
        }
        secondData.push(sum);
        sum = 0;
      }

      firstData.push(JSON.parse(JSON.stringify(secondData)));
      secondData = [];
    }
    console.log('卷积值', firstData)
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
    console.log('firstData', firstData);
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
        // 对每个元素应用ReLU函数
        newRow.push(Math.max(0, row[j]));
      }
      result.push(newRow);
    }
    return result;
  }
  // 池化 - 减少特征值，加快运算速度
  const maxPooling = (featureMap) => {
    let pooledMap = [];
    console.log("featureMap.length", featureMap.length);
    console.log("poolSizeheight", poolSizeheight);

    console.log("featureMap[0].length", featureMap[0].length);
    console.log("poolSizeWidth", poolSizeWidth);
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

  function fullyConnectedLayer(x) {
    const y = []; // 全连接层的输出向量
    // 计算全连接层的输出向量
    for (let i = 0; i < m; i++) {
      y[i] = window.b[i];
      for (let j = 0; j < n; j++) {
        y[i] += window.W[j][i] * x[j];
      }
      y[i] = relu(y[i]);
    }
    return y;
  }

  // 全连接层
  const fullyConnectedLayerEntry = (flatFeatureVector) => {

    for (let i = 0; i < n; i++) {
      window.W[i] = [];
      for (let j = 0; j < m; j++) {
        window.W[i][j] = Math.random(); // 这里使用随机初始化权重
      }
    }

    // 初始化偏置向量 b
    for (let i = 0; i < m; i++) {
      window.b[i] = Math.random(); // 这里使用随机初始化偏置
    }

    const prediction = fullyConnectedLayer(flatFeatureVector);
    console.log("prediction", prediction);

  }

  const submit = () => {

    let firstConvolve = getSpecify();
    console.log('得到所有特征图', firstConvolve);

    let stackedFeatureMaps = filter(firstConvolve);
    console.log('堆叠后的特征函数:', stackedFeatureMaps);

    let transformedFeatureMaps = transformUnLine(stackedFeatureMaps);
    console.log("非线性变化:", transformedFeatureMaps);

    let maxPoolingData = maxPooling(transformedFeatureMaps);
    console.log("池化操作:", maxPoolingData);

    let oneLevelData = maxPoolingData.flat();
    console.log("扁平化操作:", oneLevelData);

    requestData(oneLevelData);

    let data = fullyConnectedLayerEntry(oneLevelData);

  }



  function trainFullyConnectedLayer(x, label, learningRate, epochs) {


    // 计算损失函数
    function computeLoss(prediction, label) {
      // 这里使用均方误差作为损失函数
      let loss = 0;
      for (let i = 0; i < m; i++) {
        loss += Math.pow(prediction[i] - label[i], 2);
      }
      return loss;
    }

    // 优化算法（梯度下降）更新权重和偏置
    function updateWeightsAndBiases(prediction, label, learningRate) {
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          window.W[j][i] -= learningRate * (prediction[i] - label[i]) * x[j];
        }
        window.b[i] -= learningRate * (prediction[i] - label[i]);
      }
    }

    for (let epoch = 0; epoch < epochs; epoch++) {
      const prediction = fullyConnectedLayer(x);
      const loss = computeLoss(prediction, label);
      updateWeightsAndBiases(prediction, label, learningRate);

      console.log(`Epoch: ${epoch + 1}, Loss: ${loss}`);
    }
  }

  const practice = () => {
    window.trainingSet.map((item) => {
      trainFullyConnectedLayer(item.features, item.label, 0.01, 100);
    });
  }

  return (
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
      <button onClick={() => submit()}>提交图像</button>
      <button onClick={() => practice()}>训练数据</button>
    </div>
  )
}


export default Paint;