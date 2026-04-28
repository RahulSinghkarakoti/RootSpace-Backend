import treeService from "../services/tree.service.js";
import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendError,
} from "../utils/response.js";


const createTree=async (req ,res)=>{
    const result=await treeService.createTree(req.body,req)
    sendCreated(res,'Tree Created Succesfully.',result)
}

const getAllTrees=async (req,res)=>{
    const result=await treeService.getAllTrees(req)
    sendSuccess(res,'All Trees fetched',result)
}
const deleteTree=async (req,res)=>{
    const id = req.params.id;
    const result=await treeService.deleteTree(id,req)
    sendSuccess(res,'Trees Deleted Successfully',result)
}
const getTreeById=async (req,res)=>{
    const id = req.params.id;
    const result=await treeService.getTreeById(id,req)
    sendSuccess(res,'Trees Fetched Successfully',result)
}
const getTreeBySlug=async (req,res)=>{
    const slug = req.params.slug;
    const result=await treeService.getTreeBySlug(slug,req)
    sendSuccess(res,'Trees Fetched Successfully',result)
}
const updateTree=async (req,res)=>{
    const result=await treeService.updateTree(req.params.id, req.body, req)
    sendSuccess(res,'Tree Updated Successfully',result)
}

export default {
    createTree,
    getAllTrees,
    deleteTree,
    getTreeBySlug,
    updateTree
}