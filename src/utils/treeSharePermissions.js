export const TREE_SHARE_RIGHTS = {
  VIEW_ONLY: ["read"],
  MEDIA_ONLY: ["read", "media"],
  ADD_PERSON: ["read", "add_person"],
  CONTRIBUTOR: ["read", "add_person", "media"],
  EDITOR: ["read", "add_person", "media", "edit_own"],
  FULL_ACCESS: ["read", "add_person", "media", "edit_own", "edit_any"],
};

export const getTreeShareRights = (permission) =>
  TREE_SHARE_RIGHTS[permission] ?? [];

export const hasTreeShareRight = (permission, right) =>
  getTreeShareRights(permission).includes(right);
