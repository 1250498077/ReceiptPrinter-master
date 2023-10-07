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
function feedforward(x) {

  for (let i = 0; i < x.length; i++) {
    neuronNetworkNeuronInstance[0][i].h = x[i];
  }

  for (let i = 1; i < neuronNetworkNeuronInstance.length; i++) {
    let singleLayer = neuronNetworkNeuronInstance[i];

    for (let j = 0; j < singleLayer.length; j++) {
      let neuron = singleLayer[i];
      neuron.h = getWeightTotal(neuronNetworkNeuronInstance[i - 1], neuron);
    }

  }
  return neuronNetworkNeuronInstance[neuronNetworkNeuronInstance.length - 1]
}


function train(allLayerData, all_y_trues) {
  let learn_rate = 0.1;
  let epochs = 10;

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
  }


  // 单独计算计算每一个神经元
  let single_d_ypred_d_w = []
  let single_d_ypred_d_h = []



  // 获取倒数第i层
  for (let i = neuronNetworkNeuronInstance.length - 1; i >= 0; i--) {

    let currentSingleLayer = neuronNetworkNeuronInstance[i];

    // 遍历当前层的每一个神经元
    for (let j = 0; j < currentSingleLayer.length; j++) {
      let currentSingleNeuron = currentSingleLayer[j];

      single_d_ypred_d_w = []
      single_d_ypred_d_h = []
      // 遍历前一层的所有神经元
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

    for (let i = 0; i < allCombineData.length; i++) {

      let currentCombineData = allCombineData[i];
      let result = 1;
      let firstNeuron = currentCombineData[0];
      for (let j = 0; j < firstNeuron.w.length; j++) {
        let current_w = firstNeuron.w[j];
        for (let z = 1; z < currentCombineData.length; z++) {
          // result = currentCombineData[z].w[j] * 
        }

      }

    }


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



export default {}