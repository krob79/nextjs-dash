//this is still in testing phase - intended to be used for uploading files

import React, { useState } from 'react';

export default function UploadImageForm() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleChange = (e:any) => {
        console.log("----handle change");
        // const file = e.target.files[0];
        // setImage(file);
        // setPreview(URL.createObjectURL(file));
    };

    const handleRemove = () => {
        console.log("----handle remove");
        // setImage(null);
        // setPreview(null);
    };

    const onSubmit=async(e:any)=>{ 
        e.preventDefault();
        const fd=new FormData();
        const image = e.target[0].files[0];
        console.log("----onSubmit image: ", image);
        fd.append('myfile',image.name);
        let res = await fetch(`http://localhost:3000/api/upload`,{
            method: 'POST',
            headers: {
              "Content-Type": "image/jpeg",
            },
            body: fd,
          })
        let response=await res.json(); 
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col items-center">
            <div className="mb-4">
                <input type="file" accept="image/*" onChange={handleChange} />
            </div>
            {preview && (
                <div className="mb-4">
                    <img src={preview} alt="Preview" className="w-32 h-32 object-cover" />
                    <button type="button" onClick={handleRemove}>Remove</button>
                </div>
            )}
            <button type="submit">Upload</button>
        </form>
    );

}

