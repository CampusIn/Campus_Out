const generateOrderNumber = ()=>{
    const date = new Date();
    const year = date.getFullYear();
    const monthNumber = date.getMonth() + 1;
    const randomDigit =Math.floor(1000 + Math.random() * 9000);
    return `CRD-${year}-${monthNumber.toString().padStart(2,"0")}-${randomDigit}`
}

export default generateOrderNumber