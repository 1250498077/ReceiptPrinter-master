

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
          if (neuronNetworkNeuronInstance.length - 1 === i) {
            let currentSingleNeuron = neuronNetworkNeuronInstance[neuronNetworkNeuronInstance.length - 1][j];
            let d_L_d_ypred = -2 * (single_y_trues[i] - currentSingleNeuron.h);
            currentSingleNeuron.d_L_d_ypred = d_L_d_ypred;
          }
          // 遍历当前神经元的每一个权重
          for (let z = 0; z < currentSingleNeuron.w.length; z++) {
            let current_w = currentSingleNeuron.w[z];
            single_d_ypred_d_h.push(current_w * deriv_sigmoid(currentSingleNeuron.h)); // 求 d_ypred_d_h
          }
          currentSingleNeuron.single_d_ypred_d_h = single_d_ypred_d_h;
          currentSingleNeuron.layer_d_ypred_d_b = deriv_sigmoid(currentSingleNeuron.h);
        }
      }

      // 当前层
      for (let i = 0; i < neuronNetworkNeuronInstance.length; i++) {

        // 如果这一层神经元的w为空数组，证明它是整个神经元网络的第一层，第一层神经元不需要计算权重
        if (neuronNetworkNeuronInstance[i][0].w.length === 0) {
          continue;
        }
        // array2 是除了当前层神经元之外，还剩下多少神经元,的出他的数组
        let array2 = [];
        for (let j = i + 1; j < neuronNetworkConfig.length; j++) {
          let array1 = [];
          for (let z = 0; z < neuronNetworkConfig[j]; z++) {
            array1.push(z)
          }
          array2.push(array1);
        }
        console.log("array2", array2)
        let path = generateCombinations(array2);
        console.log("pathpathpathpath", path)
        // 上面i是表示当前在那一层，当前神经元的位置
        // path 是 [[0, 0], [0, 1]]
        let pathInArr = [];
        for (let j = 0; j < path.length; j++) {
          // 单个路径
          let singlePath = path[j];
          let result = 1;
          for (let z = singlePath.length - 1; z >= 0; z--) {
            if (z === singlePath.length - 1) {
              result = result * neuronNetworkNeuronInstance[neuronNetworkNeuronInstance.length - 1][singlePath[z]].d_L_d_ypred;
            }
            if (z < singlePath.length - 1) {
              // 倒数第几位
              let daoshu = singlePath.length - 1 - z
              // 就让它恢复到第几位
              result = result * neuronNetworkNeuronInstance[neuronNetworkNeuronInstance.length - 1 - daoshu][singlePath[z]].single_d_ypred_d_h[singlePath[z]];
            }
            pathInArr.push(result)
          }
        }


        // 遍历当前神经元的所有权重
        for (let j = 0; j < neuronNetworkNeuronInstance[i].length; j++) {
          let currentSingleNeuron = neuronNetworkNeuronInstance[i][j];
          let currentAverageSum = 0;
          currentSingleNeuron.inLayerNum

          // 我现在要得到到达这个神经元有多少条 link ，将link的数据算好全部保存起来存到数组里面去
          for (let z = 0; z < neuronNetworkNeuronInstance[i][j].w.length; z++) {
            let current_w = neuronNetworkNeuronInstance[i][j].w[z];

          }

        }



      }


      // ===========================================================================================================


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