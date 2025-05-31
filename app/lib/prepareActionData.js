import {v4 as uuidv4} from 'uuid';

export async function prepareActionData(form) {
    console.log("----prepareActionData - formData:");
    const formData = new FormData(form);
    
    for (let [key, value] of formData.entries()) {
      console.log("-", key, value);
    }

    const currentImageFile = formData.get('image_url').name;
    console.log("----currentImageFile: ", currentImageFile);

    // 1. Create new FormData object and rename the image file
    const actionData = new FormData();
    actionData.set('name', formData.get('name'));
    actionData.set('email', formData.get('email'));
    if(formData.get('prev_image_url')){
        actionData.set('prev_image_url', formData.get('prev_image_url').name);
    }else{
        actionData.set('prev_image_url', '');
    }
    

    if(currentImageFile){
        let newFileName;
        //if there is no image in the formData, it means this might be a new user with a new image upload, so we need to create one
        if(!formData.get('id') || formData.get('id') === '') {
            let uuid = uuidv4();
            console.log("----No ID found - setting new ID: ", uuid);
            actionData.set('id', uuid);
            //new image name will be "image_url-<uuid>.<filetype>"
            //this way the image is uniquely tied to the user, but also creates the same image name and overwrites previous versions
            newFileName = `image_url-${uuid}.${currentImageFile.split(".").pop()}`;
        }else{
            actionData.set('id', formData.get('id'));
            newFileName = `image_url-${formData.get('id')}.${currentImageFile.split(".").pop()}`;
        }
        
        actionData.set('image_url', document.getElementById("image_url").files[0], newFileName );

        //Send form data and use image information to upload to S3
        const imageUploadResponse = await fetch('/api/s3upload', {
        method: 'POST',
        body: actionData,
        });
        console.log(`----Response from ${imageUploadResponse.url}: ${imageUploadResponse.statusText}`);

        //wait for the response to complete before returning actionData
        const imgResponse = await imageUploadResponse.json();
    }else{
        actionData.set('id', formData.get('id'));
        actionData.set('image_url', formData.get('prev_image_url') );
    }
    console.log("---returning actionData:");
    for (let [key, value] of actionData.entries()) {
      console.log("-", key, value);
    }

    return actionData;
};