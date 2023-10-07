import ne from './Neurontest';

let neuronNetworkConfig = [];  // 配置神经网络结构
let neuronNetworkNeuronInstance = [];  // 配置神经网络结构
let learn_rate = 0.1;  // 学习率
let trainNumTotal = new Array(100).fill('');
let trainNum = 0;
let ispanduan = true
function setNeuronNetworkConfig(value) {
  neuronNetworkConfig = value;
}
function setNeuronNetworkNeuronInstance(value) {
  neuronNetworkNeuronInstance = value;
}


// ====================================================================

// 初始化神经网络数据
function createNeuron(numW = 0) {
  let w = [];
  for (let i = 0; i < numW; i++) {
    w.push(generateNormalRandom(0, 1))
  }
  return {
    w: w,
    b: generateNormalRandom(0, 1),
    // 当前的预测值
    h: 0
  }
}

// 创建神经网络，创建一个有固定长度的输入层，输出层的神经网络，不定的隐藏层
function createNetwork() {

  neuronNetworkConfig.map((singleLayerNeuronNumber, index) => {
    let singleLayer = []
    for (let i = 0; i < singleLayerNeuronNumber; i++) {
      if (index - 1 < 0) {
        singleLayer.push(createNeuron())
      } else {
        singleLayer.push(createNeuron(neuronNetworkConfig[index - 1]))
      }
    }
    neuronNetworkNeuronInstance.push(singleLayer);
  })

  // 给每一个神经元都设置前一层和后一层的指向
  for (let i = 0; i < neuronNetworkNeuronInstance.length; i++) {
    let currentLayer = neuronNetworkNeuronInstance[i];
    let nextLayer = [];
    let beforeLayer = []
    if (neuronNetworkNeuronInstance.length >= 2 && neuronNetworkNeuronInstance.length - 1 > i) {
      nextLayer = neuronNetworkNeuronInstance[i + 1];
    }
    if (i > 0 && neuronNetworkNeuronInstance.length >= 2) {
      beforeLayer = neuronNetworkNeuronInstance[i - 1];
    }

    for (let j = 0; j < currentLayer.length; j++) {
      let singleNeuron = currentLayer[j];
      singleNeuron.layerNum = i;
      singleNeuron.inLayerNum = j;
      singleNeuron.target = false;
      if (i === 0) {
        singleNeuron.type = "start"
      } else if (i === neuronNetworkNeuronInstance.length - 1) {
        singleNeuron.type = "end"
      } else {
        singleNeuron.type = "hidden"
      }
    }
  }
  return neuronNetworkNeuronInstance;
}

// 正向传播才用到的激活函数
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// 反向传播的求导数代码
function deriv_sigmoid(x) {
  let fx = sigmoid(x)
  return fx * (1 - fx)
}

// 计算损失率，损失率越低，越成功
// y_true 是正确值
// y_pred 是实际值
function mse_loss(y_true, y_pred) {
  let sum_avarage = [];
  y_true.map((y_true_item, y_true_item_index) => {
    let totalNum = 0;
    y_true_item.map((one, oneIndex) => {
      totalNum = totalNum + Math.pow((one - y_pred[y_true_item_index][oneIndex]), 2);
    });
    let avarage = totalNum / y_true_item.length;
    sum_avarage.push(avarage);
  });
  let sum = 0;
  sum_avarage.map((avarage) => {
    sum = sum + avarage;
  })
  return sum / sum_avarage.length;
}

// 生成权重随机数 - 符合高斯分布 - 用于初始化权重
function generateNormalRandom(mean, stddev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // 生成 (0,1) 之间的随机数
  while (v === 0) v = Math.random(); // 生成 (0,1) 之间的随机数

  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + stddev * z;
}

// 在正向传播过程中，计算每个神经元的输入值，即w1*x1 + w2*x2 + w3*x3 + b = 每个神经元输入值 
function getWeightTotal(lastLayer, currentNeuron) {

  let sum = 0;
  for (let i = 0; i < lastLayer.length; i++) {
    let lastNeuron = lastLayer[i];
    sum = sum + lastNeuron.h * currentNeuron.w[i];
  }
  return sigmoid(sum + currentNeuron.b);
}

// 正向传播函数
// allLayerData 是输入数据
// 最终 return 一个实际值
function feedforward(allLayerData) {
  let predEndLayerDataList = [];
  for (let z = 0; z < allLayerData.length; z++) {
    let singleData = allLayerData[z];

    // 第一层赋值
    for (let i = 0; i < singleData.length; i++) {
      neuronNetworkNeuronInstance[0][i].h = singleData[i];
    }
    let predSingleEndLayerData = [];
    // 后面的赋值操作
    for (let i = 1; i < neuronNetworkNeuronInstance.length; i++) {
      let singleLayer = neuronNetworkNeuronInstance[i];

      for (let j = 0; j < singleLayer.length; j++) {
        let neuron = singleLayer[j];
        // 上一层的神经元（获取上一层的h），当前单个神经元（当前神经元的w）
        // 最后一层才会记录
        let h = getWeightTotal(neuronNetworkNeuronInstance[i - 1], neuron);
        neuron.h = h;
        if (i === neuronNetworkNeuronInstance.length - 1) {
          // getWeightTotal 获取当前神经元的输出h
          predSingleEndLayerData.push(h);
        }
      }
    }
    predEndLayerDataList.push(predSingleEndLayerData);
  }
  return predEndLayerDataList;
}

// 当调用这个方法，代表开始训练
// 以下的 neuron 变量代表神经网络的其中一个神经元
// allLayerData 是所有的训练数据
// all_y_trues 是所有数据的真实值
// callbackLoss 是将损失率回调到外面去
function train(allLayerData, all_y_trues, callbackLoss, callBackFinish) {

  trainNumTotal.map((i, index) => {

    setTimeout(() => {
      trainNum = index;
      // 将数据集的每单个数据输入神经网络，这里的目的是形成每一个神经元的值 h
      for (let z = 0; z < allLayerData.length; z++) {
        let singleData = allLayerData[z];

        // 第一层赋值
        for (let i = 0; i < singleData.length; i++) {
          neuronNetworkNeuronInstance[0][i].h = singleData[i];
        }
        // 后面的赋值操作
        for (let i = 1; i < neuronNetworkNeuronInstance.length; i++) {
          let singleLayer = neuronNetworkNeuronInstance[i];

          for (let j = 0; j < singleLayer.length; j++) {
            let neuron = singleLayer[j];
            neuron.h = getWeightTotal(neuronNetworkNeuronInstance[i - 1], neuron);
          }
        }
        trainSingleData(all_y_trues[z]);
      }

      function trainSingleData(single_y_trues) {
        // 单独计算计算每一个神经元
        let single_d_ypred_d_w = [];
        let single_d_ypred_d_h = [];

        // 获取倒数第i层
        for (let i = neuronNetworkNeuronInstance.length - 1; i >= 0; i--) {

          let currentSingleLayer = neuronNetworkNeuronInstance[i];

          // 遍历当前层的每一个神经元
          for (let j = 0; j < currentSingleLayer.length; j++) {
            let currentSingleNeuron = currentSingleLayer[j];
            // 对每一个神经元求导数
            single_d_ypred_d_w = [];
            // 对每一个神经元求链式求导所需要的中间导数
            single_d_ypred_d_h = [];
            // 遍历前一层的所有神经元
            // 第一层没有权重，所以需要 i > 0
            if (i > 0) {
              let frontSingleLayer = neuronNetworkNeuronInstance[i - 1];
              for (let q = 0; q < frontSingleLayer.length; q++) {
                let frontSingleNeuron = frontSingleLayer[q];
                single_d_ypred_d_w.push(frontSingleNeuron.h * deriv_sigmoid(currentSingleNeuron.h)); // 求 d_ypred_d_w
              }
              currentSingleNeuron.single_d_ypred_d_w = single_d_ypred_d_w;
            }
            // 只有最后一层才会设置
            if (i === neuronNetworkNeuronInstance.length - 1) {
              let currentSingleNeuron = neuronNetworkNeuronInstance[neuronNetworkNeuronInstance.length - 1][i];
              let d_L_d_ypred = -2 * (single_y_trues[j] - currentSingleNeuron.h);
              currentSingleNeuron.d_L_d_ypred = d_L_d_ypred;
            }
            // 遍历当前神经元的每一个权重
            for (let z = 0; z < currentSingleNeuron.w.length; z++) {
              let current_w = currentSingleNeuron.w[z];
              single_d_ypred_d_h.push(current_w * deriv_sigmoid(currentSingleNeuron.h)); // 求 d_ypred_d_h
            }
            currentSingleNeuron.single_d_ypred_d_h = single_d_ypred_d_h
            currentSingleNeuron.layer_d_ypred_d_b = deriv_sigmoid(currentSingleNeuron.h);
          }
        }
        function generateCombinations(arrays) {
          const result = [];
          function generate(index, currentCombination) {
            if (index === arrays.length) {
              result.push([...currentCombination]);
              return;
            }
            const currentArray = arrays[index];
            for (let i = 0; i < currentArray.length; i++) {
              currentCombination.push(currentArray[i]);
              generate(index + 1, currentCombination);
              currentCombination.pop();
            }
          }
          generate(0, []);
          return result;
        }

        function createTree(currentLayerNum, currentNeuronNum, neuronNetworkNeuronInstance) {
          let firstLayer = [neuronNetworkNeuronInstance[currentLayerNum][currentNeuronNum]]
          let otherLayer = []
          for (let i = currentLayerNum + 1; i < neuronNetworkNeuronInstance.length; i++) {
            otherLayer.push(neuronNetworkNeuronInstance[i])
          }
          let allPath = generateCombinations([firstLayer, ...otherLayer]);
          return allPath;
        }
        // 先遍历第一层
        for (let i = 0; i < neuronNetworkNeuronInstance.length; i++) {
          for (let j = 0; j < neuronNetworkNeuronInstance[i].length; j++) {
            let data = createTree(i, j, neuronNetworkNeuronInstance)
            calculate(data);
          }
        }
        // console.log("============================")
        function calculate(allCombineData) {
          // 遍历一下所有链路
          let a = [];
          for (let g = 0; g < allCombineData.length; g++) {
            a = []
            for (let j = 0; j < allCombineData[g].length; j++) {
              a.push(allCombineData[g][j].inLayerNum)
            }
          }

          // 第一层神经元的权重个数
          let different_sum_in_different_w = [];
          let different_sum_in_different_b = [];
          let firstNeuron = null;
          for (let i = 0; i < allCombineData[0][0].w.length; i++) {
            different_sum_in_different_w.push([]);
          }
          for (let i = 0; i < allCombineData.length; i++) {

            let currentCombineData = allCombineData[i];
            let result_w = 1;
            let result_b = 1;
            firstNeuron = currentCombineData[0];
            // 因为第一层w是空数组，所进不来，求解第一个神经元的每一个w
            for (let j = 0; j < firstNeuron.w.length; j++) {
              // 进入权重计算
              // 对当前神经元指定权重求偏导数
              result_w = 1;
              result_b = 1;
              // 我们只有第一个神经元用到 d_ypred_d_w
              let current_dw = firstNeuron.single_d_ypred_d_w[j];
              let current_db = firstNeuron.layer_d_ypred_d_b;
              result_w = result_w * current_dw;
              result_b = result_b * current_db;
              // 求解当前组合的梯度，currentCombineData=[第一层第n个神经元， 第二层第n个神经元， 第三层第n个神经元]
              // 下面循环只是求解一个神经元权重的一种链路的梯度
              for (let z = 0; z < currentCombineData.length; z++) {
                // console.log('进来end1')
                if (z >= 1) {
                  // 获取上一层的神经元,因为当前神经元与上一层所有神经元都有联系
                  let index = currentCombineData[z - 1].inLayerNum;

                  let d_ypred_d_h = currentCombineData[z].single_d_ypred_d_h[index];
                  result_w = result_w * d_ypred_d_h;
                  // console.log("111result_w", result_w)
                  result_b = result_b * d_ypred_d_h;
                }
                if (currentCombineData[z].type === "end") {

                  // 这里可以求出每一条链路的梯度
                  result_w = result_w * currentCombineData[z].d_L_d_ypred * learn_rate;

                  result_b = result_b * currentCombineData[z].d_L_d_ypred * learn_rate;
                  different_sum_in_different_w[j].push(result_w);

                  // b只需要push一次
                  if (j === 0) {
                    different_sum_in_different_b.push(result_b);
                  }
                }
              }
            }
          }
          // 每计算完一个神经元的所有权重，就对这个神经元进行全体赋值
          for (let j = 0; j < firstNeuron.w.length; j++) {

            let sum_w = 0;
            for (let i = 0; i < different_sum_in_different_w[j].length; i++) {
              sum_w = sum_w + different_sum_in_different_w[j][i];
            }
            sum_w = sum_w / different_sum_in_different_w[j].length
            neuronNetworkNeuronInstance[firstNeuron.layerNum][firstNeuron.inLayerNum].w[j] -= sum_w;
          }

          let sum_b = 0;
          for (let i = 0; i < different_sum_in_different_b.length; i++) {
            sum_b = sum_b + different_sum_in_different_b[i];
          }
          neuronNetworkNeuronInstance[firstNeuron.layerNum][firstNeuron.inLayerNum].b -= sum_b / different_sum_in_different_b.length;

        }

      }
      if (trainNum % 10 === 0) {
        let y_preds = feedforward(allLayerData);
        let loss = mse_loss(all_y_trues, y_preds)
        if (callbackLoss) { callbackLoss(loss); }
      }
    }, 0)
  })

  if (callBackFinish) {
    console.log("训练完成");
    callBackFinish(JSON.parse(JSON.stringify(neuronNetworkNeuronInstance)));
  }

}

// train(data, all_y_trues);
console.log("end ---- neuronNetworkNeuronInstance", neuronNetworkNeuronInstance);

function getDataFromModel(singleData) {

  let result = []
  // 第一层赋值
  for (let i = 0; i < singleData.length; i++) {
    neuronNetworkNeuronInstance[0][i].h = singleData[i];
  }
  // 后面的赋值操作
  for (let i = 1; i < neuronNetworkNeuronInstance.length; i++) {
    let singleLayer = neuronNetworkNeuronInstance[i];

    for (let j = 0; j < singleLayer.length; j++) {
      let neuron = singleLayer[j];
      neuron.h = getWeightTotal(neuronNetworkNeuronInstance[i - 1], neuron);
      if (i === neuronNetworkNeuronInstance.length - 1) {
        result.push(neuron.h)
      }
    }
  }

  return result;
}

// console.log("结果", getDataFromModel([10, 10]))

// 执行顺序从前到后
export { setNeuronNetworkConfig, createNetwork, train, getDataFromModel, setNeuronNetworkNeuronInstance } 