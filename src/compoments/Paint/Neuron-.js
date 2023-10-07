// 一个神经元对象内部变量包括：1、被上一层输入的值。2、多个输出权重。3偏置值。4、激活函数
class Neuron {
  constructor(numInputs) {
    this.weights = [];
    this.bias = 0.2; // 随机初始化偏置值
    // console.log("this.bias", this.bias)
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
    // console.log('this.weights = ', this.weights);
    // console.log('inputs = ', inputs);
    // console.log('sum = ', sum);
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
    // console.log("actualOutput = ", actualOutput);
    const error = expectedOutput - actualOutput;
    // console.log("error：", error);
    // 计算梯度
    const gradient = this.sigmoidDerivative(actualOutput) * error;
    // console.log("梯度：", gradient);
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


class NeuralNetwork {
  constructor(numInputs, numHiddenLayers, numNeuronsPerHiddenLayer, numOutputs) {
    this.hiddenLayers = [];
    this.outputLayer = [];

    // 创建隐藏层
    for (let i = 0; i < numHiddenLayers; i++) {
      const hiddenLayer = [];
      for (let j = 0; j < numNeuronsPerHiddenLayer; j++) {
        const neuron = new Neuron(i === 0 ? numInputs : numNeuronsPerHiddenLayer);
        hiddenLayer.push(neuron);
      }
      this.hiddenLayers.push(hiddenLayer);
    }

    // 创建输出层神经元
    for (let i = 0; i < numOutputs; i++) {
      const neuron = new Neuron(numNeuronsPerHiddenLayer);
      this.outputLayer.push(neuron);
    }
  }

  // 计算输出
  activate(inputs) {
    let hiddenOutputs = inputs;
    for (let i = 0; i < this.hiddenLayers.length; i++) {
      const hiddenLayer = this.hiddenLayers[i];
      const hiddenLayerOutputs = hiddenLayer.map(neuron => neuron.activate(hiddenOutputs));
      hiddenOutputs = hiddenLayerOutputs;
    }

    const outputs = this.outputLayer.map(neuron => neuron.activate(hiddenOutputs));
    return outputs;
  }

  // 反向传播以更新权重
  backpropagate(inputs, expectedOutputs, learningRate) {
    if (inputs.length !== this.hiddenLayers[0][0].weights.length) {
      throw new Error('输入的数量与隐藏层神经元的权重数量不匹配');
    }
    console.log("expectedOutputs = ", expectedOutputs)
    console.log("this.outputLayer = ", this.outputLayer)
    if (expectedOutputs.length !== this.outputLayer.length) {
      throw new Error('期望输出的数量与输出层神经元的数量不匹配');
    }

    // 反向传播到输出层
    let hiddenOutputs = inputs;
    for (let i = 0; i < this.hiddenLayers.length; i++) {
      const hiddenLayer = this.hiddenLayers[i];
      const hiddenLayerOutputs = hiddenLayer.map(neuron => neuron.activate(hiddenOutputs));
      hiddenOutputs = hiddenLayerOutputs;
    }

    const actualOutputs = this.outputLayer.map(neuron => neuron.activate(hiddenOutputs));
    const outputErrors = [];

    for (let i = 0; i < this.outputLayer.length; i++) {
      const neuron = this.outputLayer[i];
      const expectedOutput = expectedOutputs[i];
      const error = expectedOutput - actualOutputs[i];
      const gradient = neuron.sigmoidDerivative(actualOutputs[i]) * error;
      outputErrors.push(error);

      // 更新输出层权重
      for (let j = 0; j < neuron.weights.length; j++) {
        neuron.weights[j] += learningRate * gradient * hiddenOutputs[j];
      }
    }

    // 反向传播到隐藏层
    let hiddenErrors = outputErrors;
    for (let i = this.hiddenLayers.length - 1; i >= 0; i--) {
      const hiddenLayer = this.hiddenLayers[i];
      const nextHiddenErrors = [];

      for (let j = 0; j < hiddenLayer.length; j++) {
        const neuron = hiddenLayer[j];
        let error = 0;

        for (let k = 0; k < this.outputLayer.length; k++) {
          const outputNeuron = this.outputLayer[k];
          error += hiddenErrors[k] * outputNeuron.weights[j];
        }

        const gradient = neuron.sigmoidDerivative(hiddenOutputs[j]) * error;
        nextHiddenErrors.push(error);

        // 更新隐藏层权重
        for (let k = 0; k < neuron.weights.length; k++) {
          neuron.weights[k] += learningRate * gradient * (i === 0 ? inputs[k] : hiddenOutputs[k]);
        }
      }

      hiddenErrors = nextHiddenErrors;
    }

    return hiddenErrors;
  }
}

// 生成随机的数据点
function generateData(numSamples) {
  const data = [];
  for (let i = 0; i < numSamples; i++) {
    const x1 = Math.random();
    const x2 = Math.random();
    if (x1 < 0.5 && x2 < 0.5) {
      data.push({ x: [x1, x2], y: 0 });
    } else if (x1 >= 0.5 && x2 >= 0.5) {
      data.push({ x: [x1, x2], y: 1 });
    }
  }
  return data;
}
console.log("generateData = ", generateData(1000));
const trainingData = generateData(1000);


const neuralNetwork = new NeuralNetwork(2, 3, 3, 1); // 创建一个2-3-3-1的三层神经网络

// // 训练数据
// const trainingData = [
//   { inputs: [0, 0], expectedOutput: [0] },
//   { inputs: [0, 1], expectedOutput: [1] },
//   { inputs: [1, 0], expectedOutput: [1] },
//   { inputs: [1, 1], expectedOutput: [0] }
// ];

const learningRate = 0.1;
const epochs = 50;
let i = 0;
// 训练神经网络
for (i = 0; i < trainingData.length; i++) {
  neuralNetwork.backpropagate(trainingData[i].x, [trainingData[i].y], learningRate);
}
console.log("i = ", i);
// 使用训练后的神经网络预测数据
const inputs = [0.1, 0.1];
const outputs = neuralNetwork.activate(inputs);
console.log('1Outputs:', outputs); // 输出预测结果
