export const channelChars: string[] = []
for (let i = 0; i <= 9; i += 1) {
  channelChars.push(String.fromCharCode(i + 48))
}
for (let i = 0; i <= 25; i += 1) {
  channelChars.push(String.fromCharCode(i + 97))
}
export const channelIdLength = 10

export const createChannelId = (): string => {
  return Array.from({ length: channelIdLength })
    .map(
      () => channelChars[Math.round(Math.random() * (channelChars.length - 1))]
    )
    .join('')
}
