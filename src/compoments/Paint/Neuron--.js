class Neuron {
  constructor(numInputs) {
    this.weights = [];
    this.bias = 0.2; // 随机初始化偏置值
    console.log("this.bias", this.bias)
    // 随机初始化输入权重
    for (let i = 0; i < numInputs; i++) {
      this.weights.push(Math.random());
    }
  }

  // 激活函数，这里使用sigmoid函数
  activate(inputs) {
    // 省略激活函数代码
    if (inputs.length !== this.weights.length) {
      throw new Error('输入的数量与权重的数量不匹配');
    }

    let sum = 0;
    for (let i = 0; i < inputs.length; i++) {
      sum += inputs[i] * this.weights[i];
    }
    sum += this.bias;
    return this.sigmoid(sum);
  }

  // 反向传播以更新权重
  backpropagate(inputs, expectedOutput, learningRate) {
    // inputs = [0.5, 0.8]
    // expectedOutput = [0.2]
    // learningRate = 0.1
    if (inputs.length !== this.weights.length) {
      throw new Error('输入的数量与权重的数量不匹配');
    }

    const actualOutput = this.activate(inputs); // input1 * weight1 + input2 * weight2 + bias
    console.log("actualOutput = ", actualOutput);
    const error = expectedOutput - actualOutput;
    console.log("error：", error);
    // 计算梯度
    const gradient = this.sigmoidDerivative(actualOutput) * error;
    console.log("梯度：", gradient);
    // 更新权重
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += learningRate * gradient * inputs[i];
    }

    return error;
  }

  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  sigmoidDerivative(x) {
    return x * (1 - x);
  }
}


// 使用这个神经元类，可以创建一个神经元对象并训练它：
// const neuron = new Neuron(2); // 创建一个具有两个输入的神经元
// const inputs = [0.5, 0.8];
// const expectedOutput = 0.2;
// const learningRate = 0.1;
// for (let i = 0; i < 10; i++) {
//   const error = neuron.backpropagate(inputs, expectedOutput, learningRate);
//   console.log('Error:', error);
// }
// const output = neuron.activate(inputs);
// console.log('Output:', output);
// console.log('weight:', neuron.weights);
// console.log("neuron", neuron)


// ================================================================================顶部
const transData = [
  [1, 2, 3, 4],
  [1, 2, 3, 4],
  [1, 2, 3, 4],
  [1, 2, 3, 4],
];
const predictData = [
  [1, 2, 3],
  [1, 2, 3],
  [1, 2, 3],
  [1, 2, 3],
];



function generateLayer(numNeuron, inputLength) {
  let layer = [];
  for (let i = 0; i < numNeuron; i++) {
    let neuron = new Neuron(inputLength);
    layer.push(neuron);
  }
  return layer;
}
// 每个 inputLength 的值都是上一层神经元的个数
let layerArr = [
  {
    numNeuron: 4,
    inputLength: 4
  },
  {
    numNeuron: 8,
    inputLength: 4
  },
  {
    numNeuron: 3,
    inputLength: 8
  },
];
let multipleLayerEntity = [];
// 生成全链接层
for (let i = 0; i < layerArr.length; i++) {
  let layerEntity = generateLayer(layerArr[i].numNeuron, layerArr[i].inputLength);
  multipleLayerEntity.push(layerEntity);
}
// 全部层级
console.log('multipleLayerEntity = ', multipleLayerEntity);


// 处理一层的关系
function getSingleLayerOutput(singleLayer, inputData) {
  let layerOutput = [];
  for (let i = 0; i < singleLayer.length; i++) {
    let singleNeuron = singleLayer[i];
    let singleOutput = singleNeuron.activate(inputData);
    layerOutput.push(singleOutput);
  }
  return layerOutput;
}
// 测试获取单层的输出，
console.log("测试获取单层的输出:", getSingleLayerOutput(multipleLayerEntity[0], transData[0]))


// 运行多层
let inputData1 = [1, 2, 3, 4];
for (let i = 0; i < multipleLayerEntity.length; i++) {
  inputData1 = getSingleLayerOutput(multipleLayerEntity[i], inputData1);
}
console.log("inputData1 = ", inputData1);


// ================================================================================底部





// ========================== 神经网络 ==============================
// class NeuralNetwork {
//   constructor(numInputs, numHidden, numOutputs) {
//     this.hiddenLayer = [];
//     this.outputLayer = [];

//     // 创建隐藏层神经元
//     for (let i = 0; i < numHidden; i++) {
//       const neuron = new Neuron(numInputs);
//       this.hiddenLayer.push(neuron);
//     }

//     // 创建输出层神经元
//     for (let i = 0; i < numOutputs; i++) {
//       const neuron = new Neuron(numHidden);
//       this.outputLayer.push(neuron);
//     }
//   }

//   // 计算输出
//   activate(inputs) {
//     const hiddenOutputs = this.hiddenLayer.map(neuron => neuron.activate(inputs));
//     const outputs = this.outputLayer.map(neuron => neuron.activate(hiddenOutputs));
//     return outputs;
//   }

//   // 反向传播以更新权重
//   backpropagate(inputs, expectedOutputs, learningRate) {
//     if (inputs.length !== this.hiddenLayer[0].weights.length) {
//       throw new Error('输入的数量与隐藏层神经元的权重数量不匹配');
//     }

//     if (expectedOutputs.length !== this.outputLayer.length) {
//       throw new Error('期望输出的数量与输出层神经元的数量不匹配');
//     }

//     // 反向传播到输出层
//     const hiddenOutputs = this.hiddenLayer.map(neuron => neuron.activate(inputs));
//     const actualOutputs = this.outputLayer.map(neuron => neuron.activate(hiddenOutputs));
//     const outputErrors = [];

//     for (let i = 0; i < this.outputLayer.length; i++) {
//       const neuron = this.outputLayer[i];
//       const expectedOutput = expectedOutputs[i];
//       const error = expectedOutput - actualOutputs[i];
//       const gradient = neuron.sigmoidDerivative(actualOutputs[i]) * error;
//       outputErrors.push(error);

//       // 更新输出层权重
//       for (let j = 0; j < neuron.weights.length; j++) {
//         neuron.weights[j] += learningRate * gradient * hiddenOutputs[j];
//       }
//     }

//     // 反向传播到隐藏层
//     const hiddenErrors = [];

//     for (let i = 0; i < this.hiddenLayer.length; i++) {
//       const neuron = this.hiddenLayer[i];
//       let error = 0;

//       for (let j = 0; j < this.outputLayer.length; j++) {
//         const outputNeuron = this.outputLayer[j];
//         error += outputErrors[j] * outputNeuron.weights[i];
//       }

//       const gradient = neuron.sigmoidDerivative(hiddenOutputs[i]) * error;
//       hiddenErrors.push(error);

//       // 更新隐藏层权重
//       for (let j = 0; j < neuron.weights.length; j++) {
//         neuron.weights[j] += learningRate * gradient * inputs[j];
//       }
//     }

//     return hiddenErrors;
//   }
// }


// // 使用这个神经网络类，可以创建一个神经网络对象并训练它：


// const neuralNetwork = new NeuralNetwork(2, 2, 2); // 创建一个具有2个输入，2个隐藏神经元和2个输出神经元的神经网络

// const inputs = [0.5, 0.8];
// const expectedOutputs = [0.2, 0.7];
// const learningRate = 0.1;

// for (let i = 0; i < 100; i++) {
//   const hiddenErrors = neuralNetwork.backpropagate(inputs, expectedOutputs, learningRate);
//   console.log('Hidden Errors:', hiddenErrors);
// }

// const outputs = neuralNetwork.activate(inputs);
// console.log('1Outputs:', outputs); // 输出经过训练后的神经网络的激活值




export default Neuron;