class MyAudioWorkletProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0]
    const output = outputs[0]

    // 处理音频数据
    for (let channel = 0; channel < output.length; channel++) {
      const inputChannelData = input[channel]
      const outputChannelData = output[channel]

      for (let i = 0; i < inputChannelData.length; i++) {
        // 在这里处理音频样本
        outputChannelData[i] = inputChannelData[i]
      }
    }

    return true
  }
}
registerProcessor('my-audio-worklet-processor', MyAudioWorkletProcessor)

// 创建音频上下文和音频工作线程节点
const audioContext = new AudioContext()

audioContext.audioWorklet
  .addModule('my-audio-worklet-processor.js')
  .then(() => {
    const workletNode = new AudioWorkletNode(audioContext, 'my-audio-worklet-processor')

    // 连接到音频图
    workletNode.connect(audioContext.destination)

    // 获取用户媒体流
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const sourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream: stream })

        // 连接到 AudioWorkletNode
        sourceNode.connect(workletNode)
      })
      .catch((error) => {
        console.log('获取音频流失败：', error)
      })
  })
  .catch((error) => {
    console.log('加载音频工作线程处理器脚本失败：', error)
  })
