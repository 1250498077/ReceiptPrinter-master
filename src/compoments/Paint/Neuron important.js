let neuronNetworkConfig = [2, 2, 2, 2, 2];
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
    singleNeuron.nextLayer = nextLayer;
    singleNeuron.beforeLayer = beforeLayer;
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


let all_d_ypred_d_w = [];
let all_d_ypred_d_b = [];
let all_d_ypred_d_h = [];
let first_all_d_ypred_d_h = [];

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

  let layer_d_ypred_d_w = [];
  let layer_d_ypred_d_b = [];
  let layer_d_ypred_d_h = [];
  let single_d_ypred_d_w = []
  let single_d_ypred_d_h = []

  // 获取倒数第i层
  for (let i = neuronNetworkNeuronInstance.length - 1; i > 0; i--) {
    let currentSingleLayer = neuronNetworkNeuronInstance[i];
    let frontSingleLayer = neuronNetworkNeuronInstance[i - 1];
    layer_d_ypred_d_w = [];
    layer_d_ypred_d_b = [];
    layer_d_ypred_d_h = [];
    // 遍历当前层的每一个神经元
    for (let j = 0; j < currentSingleLayer.length; j++) {
      let backSingleNeuron = currentSingleLayer[j];

      single_d_ypred_d_w = []
      single_d_ypred_d_h = []
      // 遍历前一层的所有神经元
      for (let q = 0; q < frontSingleLayer.length; q++) {
        let frontSingleNeuron = frontSingleLayer[q]
        // w5, w6
        single_d_ypred_d_w.push(frontSingleNeuron.h * deriv_sigmoid(backSingleNeuron.h)); // 求 d_ypred_d_w
      }
      layer_d_ypred_d_w.push(single_d_ypred_d_w);


      // 遍历当前层神经元的每一个权重
      for (let z = 0; z < backSingleNeuron.w.length; z++) {
        let current_w = backSingleNeuron.w[z];
        single_d_ypred_d_h.push(current_w * deriv_sigmoid(backSingleNeuron.h)); // 求 d_ypred_d_h
      }
      layer_d_ypred_d_b.push(deriv_sigmoid(backSingleNeuron.h));   // 求 d_ypred_d_b
      layer_d_ypred_d_h.push(single_d_ypred_d_h);

    }
    all_d_ypred_d_w.push(layer_d_ypred_d_w); // 三维数组
    all_d_ypred_d_h.push(layer_d_ypred_d_h); // 三维数组
    all_d_ypred_d_b.push(layer_d_ypred_d_b); // 二维数组

  }


  // 存取除输出层的扁平化所有的数据
  for (let i = 0; i < all_d_ypred_d_h.length; i++) {
    // 遍历每一个导数层的每一个神经元
    let frontLayer = all_d_ypred_d_h[i].flat(Infinity);
    first_all_d_ypred_d_h.push(frontLayer);
  }

  console.log("all_d_ypred_d_w", all_d_ypred_d_w);
  console.log("all_d_ypred_d_h", all_d_ypred_d_h);
  console.log("all_d_ypred_d_b", all_d_ypred_d_b);
  console.log("first_all_d_ypred_d_h", first_all_d_ypred_d_h);

  // 计算输出层的平方差， 一维数组
  // let all_d_L_d_ypred = [];
  for (let i = 0; i < all_y_trues.length; i++) {
    for (let j = 0; j < all_y_trues[i].length; j++) {
      singleDataInSingleData(neuronNetworkNeuronInstance, j, all_y_trues[i][j]);
    }
  }

  // console.log("all_d_L_d_ypred", all_d_L_d_ypred)
  // console.log('all_d_ypred_d_w', all_d_ypred_d_w)
  function singleDataInSingleData(neuronNetworkNeuronInstance, j, true_value) {
    let d_L_d_ypred = -2 * (true_value - neuronNetworkNeuronInstance[neuronNetworkNeuronInstance.length - 1][j].h);
    // 倒数遍历每一层
    for (let i = neuronNetworkNeuronInstance.length - 1; i > 0; i--) {
      let singleLayer = neuronNetworkNeuronInstance[i];
      let currentLayerNum = i;
      let d_currentLayerNum = i - 1; // 导数层永远比神经元层少一层

      // 遍历每一层的每一个神经元
      for (let j = 0; j < singleLayer.length; j++) {
        let singleNeuron = singleLayer[j];

        // 遍历每一个权重
        for (let z = 0; z < singleNeuron.w.length; z++) {
          otherNumber(i, j, z, neuronNetworkNeuronInstance);
        }
      }
    }
  }
}

// layerNum 哪一层，whichNeuron 哪一个神经元
function otherNumber(whichLayer, whichNeuron, whichWeight, neuronNetworkNeuronInstance) {

  // 导数层的总长度
  let all_layer_d_ypred_d_w_num = all_d_ypred_d_w.length;
  let result = 1;

  // 记录导数层该后退多少，神经元层后退多少，导数层就要后退多少，最开始 back_pace = 0
  let back_pace = (neuronNetworkNeuronInstance.length - 1) - whichLayer;

  // 对于权重求导的来说，到哪里就取哪一层的导数
  // (all_layer_d_ypred_d_w_num - 1) - back_pace 得出导数层应该取那一层的权重偏导数,操作的是哪个神经元，就返回哪个神经元的
  let d_ypred_d_w = 0;
  // 对应神经元的偏置
  let d_ypred_d_b = 0;
  // all_d_ypred_d_w[(all_layer_d_ypred_d_w_num - 1) - back_pace][whichNeuron][whichWeight],
  // if (back_pace === 0) {
  //   // 倒数第一层输出层的权重
  //   neuronNetworkNeuronInstance[whichLayer][whichNeuron].w[whichWeight] -= learn_rate * d_L_d_ypred * all_d_ypred_d_w[all_d_ypred_d_w.length - 1][whichNeuron][whichWeight]
  //   neuronNetworkNeuronInstance[whichLayer][whichNeuron].b -= learn_rate * d_L_d_ypred * all_d_ypred_d_b[all_d_ypred_d_b.length - 1][whichNeuron]
  // } else if (back_pace === 1) {
  //   neuronNetworkNeuronInstance[whichLayer][whichNeuron].w[whichWeight] -= learn_rate * d_L_d_ypred * 
  // } else {

  // }


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