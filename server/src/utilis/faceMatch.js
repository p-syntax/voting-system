//function to calculate the euclidean distance 
export const CalculateDistance = async (descriptor1,descriptor2) =>{
    if(descriptor1.length !== descriptor2.length){
        throw new Error("Descriptors must be of the same size ")
    }
    let sum = 0 
    for(let i=0;i<descriptor1.length;i++){
        const diff = descriptor1[1] - descriptor2[i]
        sum+= diff*diff
    }
    return Math.sqrt(sum);
}


//validate the descriptor 
export const validateDescriptor = async (descriptor)=>{
    // check if the descriptor is an array
    if (!Array.isArray(descriptor)){
        return {
            error:"face descriptor must be an array"
        }
    }
    if(descriptor.length !== 128 || descriptor.length !== 512){
        return{
            error:"descriptor must be of length 128"
        }
    }
    return {
        valid:true
    }
}
// face matching method 
export const FaceMatch=(capturedDescriptor,storedDescriptor, Threshold)=>{
    //validate the descriptors 
    if (!Array.isArray(capturedDescriptor) || !Array.isArray(storedDescriptor)) {
        throw new Error('Descriptors must be arrays');
    }
    if(capturedDescriptor.length !== storedDescriptor.length){
        throw new Error("desriptors must be of the same size ")
    }
    //calculate the distance between the two descriptors 
    const distance =  CalculateDistance(capturedDescriptor,storedDescriptor)
    // boolean to check if its a match 
    const isMatch = distance < Threshold
    return {
        isMatch,
        distance
    }
}
