import treeService from "./tree.service.js";
import {
    sendSuccess,
    sendCreated,
    sendBadRequest,
    sendError,
} from "../../utils/response.js";
import { cacheSet, invalidateTreeCache } from "../../lib/cache.js";


const createTree = async (req, res) => {
    const result = await treeService.createTree(req.body, req)
    await invalidateTreeCache(result.id, req.user?.id);
    sendCreated(res, 'Tree Created Succesfully.', result)
}

const generateShareLink = async (req, res) => {
    const result = await treeService.generateShareLink(req.params.treeId, req.body, req);
    await invalidateTreeCache(req.params.treeId, req.user?.id);
    sendSuccess(res, "Share link generated successfully", result);
}

const getAllSharedTrees = async (req, res) => {
    const result = await treeService.getAllSharedTrees(req.params.treeId, req);
    sendSuccess(res, "Shared trees fetched successfully", result);
}

const deleteShareLink = async (req, res) => {
    const result = await treeService.deleteShareLink(req.params.treeId, req.params.token, req);
    await invalidateTreeCache(req.params.treeId, req.user?.id);
    sendSuccess(res, "Share link deleted successfully", result);
}

const updateTreeShareLink = async (req, res) => {
    const result = await treeService.updateSharelink(req.params.treeId, req.params.token,req.body, req);
    await invalidateTreeCache(req.params.treeId, req.user?.id);
    sendSuccess(res, "Share link updated successfully", result);
}

const getAllTrees = async (req, res) => {
    const result = await treeService.getAllTrees(req)
    if (res.locals?.cacheKey) {
        await cacheSet(res.locals.cacheKey, { message: 'All Trees fetched', data: result }, res.locals.cacheTTL);
    }
    sendSuccess(res, 'All Trees fetched', result)
}
const deleteTree = async (req, res) => {
    const id = req.params.id;
    const result = await treeService.deleteTree(id, req)
    await invalidateTreeCache(id, req.user?.id);
    sendSuccess(res, 'Trees Deleted Successfully', result)
}
const getTreeById = async (req, res) => {
    const id = req.params.id;
    const result = await treeService.getTreeById(id, req)
    if (res.locals?.cacheKey) {
        await cacheSet(res.locals.cacheKey, { message: 'Trees Fetched Successfully', data: result }, res.locals.cacheTTL);
    }
    sendSuccess(res, 'Trees Fetched Successfully', result)
}
const getTreeBySlug = async (req, res) => {
    const slug = req.params.slug;
    const result = await treeService.getTreeBySlug(slug, req)
    if (res.locals?.cacheKey) {
        await cacheSet(res.locals.cacheKey, { message: 'Trees Fetched Successfully', data: result }, res.locals.cacheTTL);
    }
    sendSuccess(res, 'Trees Fetched Successfully', result)
}
const updateTree = async (req, res) => {
    const result = await treeService.updateTree(req.params.id, req.body, req)
    await invalidateTreeCache(req.params.id, req.user?.id);
    sendSuccess(res, 'Tree Updated Successfully', result)
}

const getCollaborations = async (req, res) => {
    console.log("getCollaborations - req.user.id:", req.user.id);
    const result = await treeService.getCollaborations(req);
    if (res.locals?.cacheKey) {
        await cacheSet(res.locals.cacheKey, { message: 'Collaborations fetched successfully', data: result }, res.locals.cacheTTL);
    }
    sendSuccess(res, 'Collaborations fetched successfully', result);
}

export default {
    createTree,
    getAllTrees,
    deleteTree,
    getTreeBySlug,
    getTreeById,
    updateTree,
    generateShareLink,
    getAllSharedTrees,
    deleteShareLink,
    updateTreeShareLink,
    getCollaborations
}