const dbDelay = () => {
  return new Promise(resolve => setTimeout(resolve, 100));  // simulating database write delay
}

module.exports = { dbDelay };
