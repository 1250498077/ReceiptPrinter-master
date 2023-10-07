let neuronNetworkConfig = [2, 2, 2, 4, 2];
let neuronNetworkNeuronInstance = [];



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
console.log("初始化neuronNetworkNeuronInstance = ", neuronNetworkNeuronInstance)
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
  let totalNum = 0;
  y_true.map((item, index) => {
    totalNum = totalNum + Math.pow((y_true[index] - y_pred[index]), 2)
  });
  return totalNum / (y_true.length - 1)
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

    // 后面的赋值操作
    for (let i = 1; i < neuronNetworkNeuronInstance.length; i++) {
      let singleLayer = neuronNetworkNeuronInstance[i];
      let predSingleEndLayerData = [];
      for (let j = 0; j < singleLayer.length; j++) {
        let neuron = singleLayer[j];
        // 上一层的神经元（获取上一层的h），当前单个神经元（当前神经元的w）
        // 最后一层才会记录
        if (i === neuronNetworkNeuronInstance.length - 1) {
          // getWeightTotal 获取当前神经元的输出h
          predSingleEndLayerData.push(getWeightTotal(neuronNetworkNeuronInstance[i - 1], neuron));
        }
      }
      predEndLayerDataList.push(predSingleEndLayerData);
    }
  }
  return predEndLayerDataList;
}


function train(allLayerData, all_y_trues) {
  let learn_rate = 0.1;
  let epochs = 10;
  let trainNum = new Array(1).fill('');
  trainNum.map(() => {
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
      trainSingleData();
    }

    function trainSingleData() {
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

      all_y_trues.map((dataArr) => {
        dataArr.map((singleData, index) => {
          let currentNeuron = neuronNetworkNeuronInstance[neuronNetworkNeuronInstance.length - 1][index];
          let d_L_d_ypred = -2 * (singleData - currentNeuron.h);
          currentNeuron.d_L_d_ypred = d_L_d_ypred;
        });
      });

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
        return generateCombinations([firstLayer, ...otherLayer]);
      }
      // 先遍历第一层
      for (let i = 0; i < neuronNetworkNeuronInstance.length; i++) {
        for (let j = 0; j < neuronNetworkNeuronInstance[i].length; j++) {
          let data = createTree(i, j, neuronNetworkNeuronInstance)
          console.log('data', data);
          calculate(data);
        }
      }
      function calculate(allCombineData) {

        // 第一层神经元的权重个数
        let different_sum_in_different_w = [];
        let different_sum_in_different_b = [];
        let firstNeuron = null;
        for (let i = 0; i < allCombineData[0][0].w.length; i++) {
          different_sum_in_different_w.push([]);
        }
        // console.log("allCombineData", allCombineData)

        for (let i = 0; i < allCombineData.length; i++) {

          let currentCombineData = allCombineData[i];
          let result_w = 1;
          let result_b = 1;
          firstNeuron = currentCombineData[0];
          // console.log("firstNeuron", JSON.parse(JSON.stringify(firstNeuron)))
          // console.log("vvvvvvvvv  different_sum_in_different_w", JSON.parse(JSON.stringify(different_sum_in_different_w)))
          // 因为第一层w是空数组，所进不来，求解第一个神经元的每一个w
          for (let j = 0; j < firstNeuron.w.length; j++) {

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
              console.log('进来end1')
              if (z >= 1) {
                // 获取上一层的神经元,因为当前神经元与上一层所有神经元都有联系
                let index = currentCombineData[z - 1].inLayerNum;
                // console.log("上一层的神经元", JSON.parse(JSON.stringify(currentCombineData[z - 1])));
                // console.log("index", index);
                // console.log("currentCombineData[z].single_d_ypred_d_h", currentCombineData[z].single_d_ypred_d_h[index]);
                let d_ypred_d_h = currentCombineData[z].single_d_ypred_d_h[index];
                result_w = result_w * d_ypred_d_h;
                result_b = result_b * d_ypred_d_h;
              }
              if (currentCombineData[z].type === "end") {
                // console.log("result_w", result_w)
                // console.log("currentCombineData[z].d_L_d_ypred", currentCombineData[z].d_L_d_ypred)
                // console.log("learn_rate", learn_rate)
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
          // console.log("结束一次数据结束一次数据结束一次数据结束一次数据结束一次数据")
        }
        // console.log("different_sum_in_different_w", different_sum_in_different_w)
        // console.log("different_sum_in_different_b", different_sum_in_different_b)
        let sum_w_arr = [];
        for (let j = 0; j < firstNeuron.w.length; j++) {

          let sum_w = 0;
          for (let i = 0; i < different_sum_in_different_w[j].length; i++) {
            sum_w = sum_w + different_sum_in_different_w[j][i];
          }
          sum_w_arr.push(sum_w / different_sum_in_different_w[j].length)

          neuronNetworkNeuronInstance[firstNeuron.layerNum][firstNeuron.inLayerNum].w[j] -= sum_w_arr[j];
        }

        let sum_b = 0;
        for (let i = 0; i < different_sum_in_different_b.length; i++) {
          sum_b = sum_b + different_sum_in_different_b[i];
        }
        neuronNetworkNeuronInstance[firstNeuron.layerNum][firstNeuron.inLayerNum].b -= sum_b / different_sum_in_different_b.length;

      }

    }

  })

  if (allLayerData) {
    let y_preds = feedforward(allLayerData);
    let loss = mse_loss(all_y_trues, y_preds)
  }

}
let data = [
  [-2, -1],
  [25, 6],
  [17, 4],
  [-15, -6],
]
let all_y_trues = [
  [1, 0],
  [0, 1],
  [0, 0],
  [0, 0]
]

train(data, all_y_trues);

console.log("end ---- neuronNetworkNeuronInstance", neuronNetworkNeuronInstance)

export { train } 