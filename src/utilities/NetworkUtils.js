
export const getTopicList = () => {
    /*return fetch('https://ec2-54-179-172-0.ap-southeast-1.compute.amazonaws.com:3001/topicList') */
     return fetch('https://jsonplaceholder.typicode.com/users')
    .then((response) => response.json())
    .then((responseJson) => {
        console.log(responseJson);
    })
    .catch((error) => {
      console.error(error);
    });
    
}

export const uploadAudio = (audiofile) => {
    const file = new FormData()
    file.append(audiofile)
    return fetch('http://ec2-54-179-172-0.ap-southeast-1.compute.amazonaws.com:3002/upload_64', {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        body: file,
        });
}