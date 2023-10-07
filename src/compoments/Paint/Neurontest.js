

let neuronNetworkConfig = [2, 2, 4, 2];
let neuronNetworkNeuronInstance = [];
let learn_rate = 0.1;
let trainNumTotal = new Array(1000).fill('');
let trainNum = 0;


// ====================================================================

// 当不传 numW，就认为是输入层,设置为空数组
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
    // singleNeuron.nextLayer = nextLayer;
    // singleNeuron.beforeLayer = beforeLayer;
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
// console.log("初始化neuronNetworkNeuronInstance = ", neuronNetworkNeuronInstance)
// ====================================================================
// ====================================================================
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}


function deriv_sigmoid(x) {
  let fx = sigmoid(x)
  return fx * (1 - fx)
}


function mse_loss(y_true, y_pred) {
  let sum_avarage = [];
  y_true.map((y_true_item, y_true_item_index) => {
    let totalNum = 0;
    y_true_item.map((one, oneIndex) => {
      totalNum = totalNum + Math.pow((one - y_pred[y_true_item_index][oneIndex]), 2)
    });
    // console.log("totalNum", totalNum)
    let avarage = totalNum / y_true_item.length;
    sum_avarage.push(avarage);
  });
  // console.log("sum_avarage", sum_avarage)
  let sum = 0;
  sum_avarage.map((avarage) => {
    sum = sum + avarage;
  })
  return sum / sum_avarage.length;
}

// 生成权重随机数 - 符合高斯分布
function generateNormalRandom(mean, stddev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // 生成 (0,1) 之间的随机数
  while (v === 0) v = Math.random(); // 生成 (0,1) 之间的随机数

  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + stddev * z;
}
// ====================================================================
function getWeightTotal(lastLayer, currentNeuron) {

  let sum = 0;
  for (let i = 0; i < lastLayer.length; i++) {
    let lastNeuron = lastLayer[i];
    sum = sum + lastNeuron.h * currentNeuron.w[i];
  }
  return sigmoid(sum + currentNeuron.b);
}

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
          // console.log('h', JSON.parse(JSON.stringify(h)));
          predSingleEndLayerData.push(h);
        }
      }
    }
    predEndLayerDataList.push(predSingleEndLayerData);
  }
  // console.log("predEndLayerDataList = ", predEndLayerDataList)
  return predEndLayerDataList;
}


function train(allLayerData, all_y_trues) {

  trainNumTotal.map((i, index) => {

    trainNum = index;
    // 将数据输入神经网络，这里的目的是形成每一个神经元的值h
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
      setTimeout(trainSingleData(all_y_trues[z]), 0);
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
          single_d_ypred_d_w = []
          // 对每一个神经元求链式求导所需要的中间导数
          single_d_ypred_d_h = []
          // 遍历前一层的所有神经元
          // 第一层没有权重，所以需要 i > 0
          if (i > 0) {
            let frontSingleLayer = neuronNetworkNeuronInstance[i - 1];
            for (let q = 0; q < frontSingleLayer.length; q++) {
              let frontSingleNeuron = frontSingleLayer[q]
              single_d_ypred_d_w.push(frontSingleNeuron.h * deriv_sigmoid(currentSingleNeuron.h)); // 求 d_ypred_d_w
            }
            currentSingleNeuron.single_d_ypred_d_w = single_d_ypred_d_w
          }
          // 遍历当前神经元的每一个权重
          for (let z = 0; z < currentSingleNeuron.w.length; z++) {
            let current_w = currentSingleNeuron.w[z];
            single_d_ypred_d_h.push(current_w * deriv_sigmoid(currentSingleNeuron.h)); // 求 d_ypred_d_h
          }
          currentSingleNeuron.single_d_ypred_d_h = single_d_ypred_d_h
          currentSingleNeuron.layer_d_ypred_d_b = deriv_sigmoid(currentSingleNeuron.h)
        }
      }

      for (let i = 0; i < single_y_trues.length; i++) {
        let currentNeuron = neuronNetworkNeuronInstance[neuronNetworkNeuronInstance.length - 1][i];
        let d_L_d_ypred = -2 * (single_y_trues[i] - currentNeuron.h);
        currentNeuron.d_L_d_ypred = d_L_d_ypred;
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
        let arr = [firstLayer, ...otherLayer]
        let arr2 = generateCombinations(arr);
        return arr2;
      }
      // 先遍历第一层
      for (let i = 0; i < neuronNetworkNeuronInstance.length; i++) {
        for (let j = 0; j < neuronNetworkNeuronInstance[i].length; j++) {
          let data = createTree(i, j, neuronNetworkNeuronInstance)
          // console.log("data", JSON.parse(JSON.stringify(data)))
          calculate(data);
        }

      }
      // console.log("============================")
      function calculate(allCombineData) {
        // console.log("allCombineData", JSON.parse(JSON.stringify(allCombineData)))
        // 遍历一下所有链路
        let a = [];
        for (let g = 0; g < allCombineData.length; g++) {
          a = []
          for (let j = 0; j < allCombineData[g].length; j++) {
            a.push(allCombineData[g][j].inLayerNum)
          }
          // console.log(a)
        }

        // 第一层神经元的权重个数
        let different_sum_in_different_w = [];
        let different_sum_in_different_b = [];
        let firstNeuron = null;
        for (let i = 0; i < allCombineData[0][0].w.length; i++) {
          different_sum_in_different_w.push([]);
        }
        // console.log("allCombineData", allCombineData)
        let aaa = []
        for (let i = 0; i < allCombineData.length; i++) {

          let currentCombineData = allCombineData[i];
          let result_w = 1;
          let result_b = 1;
          firstNeuron = currentCombineData[0];
          // console.log("firstNeuron", JSON.parse(JSON.stringify(firstNeuron)))
          // console.log("vvvvvvvvv  different_sum_in_different_w", JSON.parse(JSON.stringify(different_sum_in_different_w)))
          // 因为第一层w是空数组，所进不来，求解第一个神经元的每一个w
          for (let j = 0; j < firstNeuron.w.length; j++) {
            // 进入权重计算
            // console.log("进入权重计算");
            // console.log("计算的神经元：", `第${firstNeuron.layerNum}层`, `第${firstNeuron.inLayerNum}个神经元`, `第${j}个权重`);
            aaa = []
            // 对当前神经元指定权重求偏导数
            result_w = 1;
            result_b = 1;
            // 我们只有第一个神经元用到 d_ypred_d_w
            let current_dw = firstNeuron.single_d_ypred_d_w[j];
            let current_db = firstNeuron.layer_d_ypred_d_b;
            result_w = result_w * current_dw;
            result_b = result_b * current_db;
            aaa.push({ num: current_dw, name: 'd_ypred_d_w 单个' })
            // 求解当前组合的梯度，currentCombineData=[第一层第n个神经元， 第二层第n个神经元， 第三层第n个神经元]
            // 下面循环只是求解一个神经元权重的一种链路的梯度
            for (let z = 0; z < currentCombineData.length; z++) {
              // console.log('进来end1')
              if (z >= 1) {
                // 获取上一层的神经元,因为当前神经元与上一层所有神经元都有联系
                let index = currentCombineData[z - 1].inLayerNum;
                // console.log("上一层的神经元", JSON.parse(JSON.stringify(currentCombineData[z - 1])));
                // console.log("index", index);
                // console.log("currentCombineData[z].single_d_ypred_d_h", currentCombineData[z].single_d_ypred_d_h[index]);
                let d_ypred_d_h = currentCombineData[z].single_d_ypred_d_h[index];
                result_w = result_w * d_ypred_d_h;
                aaa.push({ num: d_ypred_d_h, name: 'd_ypred_d_h 可连续' })
                result_b = result_b * d_ypred_d_h;
              }
              if (currentCombineData[z].type === "end") {
                // console.log("result_w", result_w)
                // console.log("currentCombineData[z].d_L_d_ypred", currentCombineData[z].d_L_d_ypred)
                // console.log("learn_rate", learn_rate)
                // 这里可以求出每一条链路的梯度
                result_w = result_w * currentCombineData[z].d_L_d_ypred * learn_rate;
                aaa.push({ num: currentCombineData[z].d_L_d_ypred, name: 'd_L_d_ypred' })
                aaa.push({ num: learn_rate, name: 'learn_rate' })
                // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", aaa)
                result_b = result_b * currentCombineData[z].d_L_d_ypred * learn_rate;
                different_sum_in_different_w[j].push(result_w);

                // b只需要push一次
                if (j === 0) {
                  different_sum_in_different_b.push(result_b);
                }
              }
            }

          }
          // console.log("结束一次数据结束一次数据结束一次数据结束一次数据结束一次数据")
        }
        // console.log("different_sum_in_different_w", different_sum_in_different_w)
        // console.log("different_sum_in_different_w", different_sum_in_different_w)
        // 每计算完一个神经元的所有权重，就对这个神经元进行全体赋值

        for (let j = 0; j < firstNeuron.w.length; j++) {

          let sum_w = 0;
          for (let i = 0; i < different_sum_in_different_w[j].length; i++) {
            sum_w = sum_w + different_sum_in_different_w[j][i];
          }
          // console.log("sum_w", sum_w)
          sum_w = sum_w / different_sum_in_different_w[j].length
          // console.log("sum_w", sum_w)
          // console.log("neuronNetworkNeuronInstance[firstNeuron.layerNum][firstNeuron.inLayerNum].w[j]", neuronNetworkNeuronInstance[firstNeuron.layerNum][firstNeuron.inLayerNum].w[j])
          // console.log("-", neuronNetworkNeuronInstance[firstNeuron.layerNum][firstNeuron.inLayerNum].w[j] - sum_w)
          neuronNetworkNeuronInstance[firstNeuron.layerNum][firstNeuron.inLayerNum].w[j] -= sum_w;
        }
        // console.log("打印快照:", JSON.parse(JSON.stringify(neuronNetworkNeuronInstance)));

        let sum_b = 0;
        for (let i = 0; i < different_sum_in_different_b.length; i++) {
          sum_b = sum_b + different_sum_in_different_b[i];
          // console.log("different_sum_in_different_b[i]", different_sum_in_different_b[i])
        }
        neuronNetworkNeuronInstance[firstNeuron.layerNum][firstNeuron.inLayerNum].b -= sum_b / different_sum_in_different_b.length;

      }

    }
    // console.log("trainNum", trainNum)
    if (trainNum % 10 === 0) {
      let y_preds = feedforward(allLayerData);

      // console.log("all_y_trues", all_y_trues);
      // console.log("y_preds", y_preds);

      let loss = mse_loss(all_y_trues, y_preds)
      console.log("loss", loss)
    }
  })


}
let data = [
  [-2, -1],
  [-4, -2],
  [-2, -3],
  [-4, -6],
  [-9, -5],
  [-1, -9],
  [-3, -7],
  [-1, -8],
  [-3, -5],
  [-7, -6],

  [2, 1],
  [4, 2],
  [2, 3],
  [4, 6],
  [9, 5],
  [1, 9],
  [3, 7],
  [1, 8],
  [3, 5],
  [7, 6],

  [-2, 1],
  [-4, 2],
  [-2, 3],
  [-4, 6],
  [-9, 5],
  [-1, 9],
  [-3, 7],
  [-1, 8],
  [-3, 5],
  [-7, 6],

  [2, -1],
  [4, -2],
  [2, -3],
  [4, -6],
  [9, -5],
  [1, -9],
  [3, -7],
  [1, -8],
  [3, -5],
  [7, -6],
]
let all_y_trues = [
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],

  [1, 1],
  [1, 1],
  [1, 1],
  [1, 1],
  [1, 1],
  [1, 1],
  [1, 1],
  [1, 1],
  [1, 1],
  [1, 1],

  [0, 1],
  [0, 1],
  [0, 1],
  [0, 1],
  [0, 1],
  [0, 1],
  [0, 1],
  [0, 1],
  [0, 1],
  [0, 1],

  [1, 0],
  [1, 0],
  [1, 0],
  [1, 0],
  [1, 0],
  [1, 0],
  [1, 0],
  [1, 0],
  [1, 0],
  [1, 0],

]

train(data, all_y_trues);

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

console.log("结果", getDataFromModel([10, 10]))
console.log("结果", getDataFromModel([-3, -9]))
console.log("结果", getDataFromModel([5, -7]))
console.log("结果", getDataFromModel([-7, 10]))


export default {}