const verifyLenguage = (text: string): boolean =>{
  return /[a-zA-Z]/.test(text) && !/[áéíóúñü]/i.test(text);
}

export default verifyLenguage
