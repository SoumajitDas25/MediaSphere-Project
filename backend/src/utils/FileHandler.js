import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const deleteTempFiles = (files)=>{ 
    
    if(files)
    {
        if(Array.isArray(files))
        {
            //when files is an array
            files.forEach(file => {
                if(!(file.path===null || file.path===undefined))
                fs.unlinkSync(file.path);
            });
        }
        else
        {
            //when files is an object containing multiple file arrays
            if(Object.keys(files).length>0)
            {
                for(const file in files)
                {
                    if(Object.prototype.hasOwnProperty.call(files,file))
                    {
                        files[file].forEach(fileItem=>{
                            if(!(fileItem.path===null || fileItem.path===undefined))
                            fs.unlinkSync(fileItem.path);
                        })
                    }
                }
            }
        }
    }
}

const deleteTempFilesByPath = (filePaths)=>{
    if(filePaths && Array.isArray(filePaths) && filePaths.length>0)
    {
        filePaths.forEach(filePath => {
            if(!(filePath===null || filePath===undefined))
            fs.unlinkSync(filePath);
        });
    }
}

const deleteTempFileByPath= (filePath)=>{
    if(!(filePath===null || filePath===undefined))
    fs.unlinkSync(filePath);
}

const getAbsoluteFilePath=(relativeFilePath)=>{
    const dirname=path.dirname(fileURLToPath(import.meta.url));
    return path.resolve( dirname,'../../',relativeFilePath);
}

export {deleteTempFiles,deleteTempFilesByPath,deleteTempFileByPath,getAbsoluteFilePath};