/*global emp */

emp.typeLibrary.Static = function (args) {
    this.name = args.name;
    this.overlayId = args.overlayId;
    this.parentId = args.parentId;
    this.featureId = args.featureId;
    this.globalType = emp.typeLibrary.types.STATIC;
    this.visible = args.visible;
    this.properties = {
      readOnly: true
    };
    this.disabled = false;

    this.coreId = (function (args) {
        if (!emp.helpers.isEmptyString(args.coreId))
        {
            return args.coreId;
        }

        return args.featureId;
    })(args);

    this.coreParent = (function(args){
        if (!emp.helpers.isEmptyString(args.coreParent))
        {
            return args.coreParent;
        }
        return undefined;
    })(args);

    this.prepForExecution = function(){
        // We dont need to do anything.
    };
};
emp.typeLibrary.Static.prototype.validate = emp.typeLibrary.base.validate;
/*
emp.typeLibrary.Static.prototype.visibility = emp.typeLibrary.base.visibility;
emp.typeLibrary.Static.prototype.locate = emp.typeLibrary.base.locate;
emp.typeLibrary.Static.prototype.hasChildren = emp.typeLibrary.base.hasChildren;
emp.typeLibrary.Static.prototype.hasParents = emp.typeLibrary.base.hasParents;
emp.typeLibrary.Static.prototype.removeChild = emp.typeLibrary.base.removeChild;
emp.typeLibrary.Static.prototype.addParent = emp.typeLibrary.base.addParent;
emp.typeLibrary.Static.prototype.addChild = emp.typeLibrary.base.addChild;
emp.typeLibrary.Static.prototype.getChildrenCoreIds = emp.typeLibrary.base.getChildrenCoreIds;
emp.typeLibrary.Static.prototype.getParentCoreIds = emp.typeLibrary.base.getParentCoreIds;
emp.typeLibrary.Static.prototype.childrenCount = emp.typeLibrary.base.childrenCount;
emp.typeLibrary.Static.prototype.parentCount = emp.typeLibrary.base.parentCount;
emp.typeLibrary.Static.prototype.getChild = emp.typeLibrary.base.getChild;
emp.typeLibrary.Static.prototype.getParent = emp.typeLibrary.base.getParent;
emp.typeLibrary.Static.prototype.isMultiParentRequired = emp.typeLibrary.base.isMultiParentRequired;
emp.typeLibrary.Static.prototype.hasChildNodes = emp.typeLibrary.base.hasChildNodes;
emp.typeLibrary.Static.prototype.getChildNodesCoreIds = emp.typeLibrary.base.getChildNodesCoreIds;
emp.typeLibrary.Static.prototype.removeFromAllParent = emp.typeLibrary.base.removeFromAllParent;
emp.typeLibrary.Static.prototype.getVisibilityWithParent = emp.typeLibrary.base.getVisibilityWithParent;
emp.typeLibrary.Static.prototype.setVisibilityWithParent = emp.typeLibrary.base.setVisibilityWithParent;
emp.typeLibrary.Static.prototype.getRootParent = emp.typeLibrary.base.getRootParent;
emp.typeLibrary.Static.prototype.getVisibilityCount = emp.typeLibrary.base.getVisibilityCount;
emp.typeLibrary.Static.prototype.getRootCoreId = emp.typeLibrary.base.getRootCoreId;
emp.typeLibrary.Static.prototype.addAffectedChildren = emp.typeLibrary.base.addAffectedChildren;
emp.typeLibrary.Static.prototype.isVisible = emp.typeLibrary.base.isVisible;
emp.typeLibrary.Static.prototype.isUnderParent = emp.typeLibrary.base.isUnderParent;
emp.typeLibrary.Static.prototype.addToOverlayFeatureList = emp.typeLibrary.base.addToOverlayFeatureList;
emp.typeLibrary.Static.prototype.removeFromOverlayFeatureList = emp.typeLibrary.base.removeFromOverlayFeatureList;
emp.typeLibrary.Static.prototype.removeAllChildrenFromOverlayFeatureList = emp.typeLibrary.base.removeAllChildrenFromOverlayFeatureList;
emp.typeLibrary.Static.prototype.addAllChildrenToOverlayFeatureList = emp.typeLibrary.base.addAllChildrenToOverlayFeatureList;
emp.typeLibrary.Static.prototype.isVisibilityAffected = emp.typeLibrary.base.isVisibilityAffected;
emp.typeLibrary.Static.prototype.getVisibilitySettingWithParent = emp.typeLibrary.base.getVisibilitySettingWithParent;
*/
