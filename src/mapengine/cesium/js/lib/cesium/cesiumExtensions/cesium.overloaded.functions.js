/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// acevedo - handle default emp icon
        Cesium.Billboard.prototype._loadImage = function() {
                var atlas = this._billboardCollection._textureAtlas;
        
                var imageId = this._imageId;
                var image = this._image;
                var imageSubRegion = this._imageSubRegion;
                var imageIndexPromise;
        
                if (Cesium.defined(image)) {
                    imageIndexPromise = atlas.addImage(imageId, image);
                }
                if (Cesium.defined(imageSubRegion)) {
                    imageIndexPromise = atlas.addSubRegion(imageId, imageSubRegion);
                }
        
                this._imageIndexPromise = imageIndexPromise;
        
                if (!Cesium.defined(imageIndexPromise)) {
                    return;
                }
        
                var that = this;
                that._id = this._id;
                imageIndexPromise.then(function(index) {
                    if (that._imageId !== imageId || that._image !== image || !Cesium.BoundingRectangle.equals(that._imageSubRegion, imageSubRegion)) {
                        // another load occurred before this one finished, ignore the index
                        return;
                    }
                    else if (that._imageId === empGlobe.getProxyUrl() + "?" + emp.utilities.getDefaultIcon().iconUrl) 
                    {
                         return;
                    }
        
                    // fill in imageWidth and imageHeight
                    var textureCoordinates = atlas.textureCoordinates[index];
                    that._imageWidth = atlas.texture.width * textureCoordinates.width;
                    that._imageHeight = atlas.texture.height * textureCoordinates.height;
        
                    that._imageIndex = index;
                    that._ready = true;
                    that._image = undefined;
                    that._imageIndexPromise = undefined;
                    Cesium.Billboard.makeDirty(that, IMAGE_INDEX_INDEX);
                }).otherwise(function(error) {
                    /*global console*/
                    var atlas = that._billboardCollection._textureAtlas;
                    var imageId = that._imageId;
                    var image = that._image;
                    var imageSubRegion = that._imageSubRegion;
                    var imageIndexPromise2;
                    //acevedo - next flag bilboard that failed to load image.
                    that.imageLoaded = false;
                    //stat acevedo edit
                    //add default icon when Cesium failed to load billboard icon
                    if (!(that._imageId === empGlobe.getProxyUrl() + "?" + emp.utilities.getDefaultIcon().iconUrl) )
                    {
                        that._imageId = empGlobe.getProxyUrl() + "?" + emp.utilities.getDefaultIcon().iconUrl;
                        that._image = empGlobe.getProxyUrl() + "?" + emp.utilities.getDefaultIcon().iconUrl;
                        //that._image = new Cesium.ConstantProperty(empGlobe.getProxyUrl() + "?" + emp.utilities.getDefaultIcon().iconUrl);
                        that._imageWidth = emp.utilities.getDefaultIcon().offset.width;
                        that._imageHeight = emp.utilities.getDefaultIcon().offset.height;
                        that.pixelOffset = new Cesium.Cartesian2(isNaN(emp.utilities.getDefaultIcon().offset.x, emp.utilities.getDefaultIcon().offset.y));
                        //that._pixelOffset = new Cesium.Cartesian2(isNaN(that._actualPosition.x + emp.utilities.getDefaultIcon().offset.x, that._actualPosition.y + emp.utilities.getDefaultIcon().offset.y + 5000));
                        that._alignedAxis = Cesium.Cartesian3.ZERO;
                        that._verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                        that._imageIndexPromise = undefined;
                        //that._loadImage();
                    }
                    if (Cesium.defined(image)) {
                    imageIndexPromise2 = atlas.addImage(that._imageId, that.image);
                }
                if (Cesium.defined(imageSubRegion)) {
                    imageIndexPromise2 = atlas.addSubRegion(that._imageId, that._imageSubRegion);
                }
        
                that._imageIndexPromise = imageIndexPromise2;
        
                if (!Cesium.defined(imageIndexPromise2)) {
                    return;
                }
        
                var that2 = that;
                that2._id = that._id;
                imageIndexPromise2.then(function(index) {
        //            if (that2._imageId !== imageId || that2._image !== image || !BoundingRectangle.equals(that2._imageSubRegion, imageSubRegion)) {
        //                // another load occurred before this one finished, ignore the index
        //                return;
        //            }
        //            else if (that2._imageId === empGlobe.getProxyUrl() + "?" + emp.utilities.getDefaultIcon().iconUrl) 
        //            {
        //                 return;
        //            }
                    // fill in imageWidth and imageHeight
                    var textureCoordinates = atlas.textureCoordinates[index];
                    //that2._imageWidth = atlas.texture.width * textureCoordinates.width;
                    //that2._imageHeight = atlas.texture.height * textureCoordinates.height;
                    
                    that2._imageWidth = emp.utilities.getDefaultIcon().offset.width;
                    that2._imageHeight = emp.utilities.getDefaultIcon().offset.height;
                    that2.pixelOffset = new Cesium.Cartesian2(isNaN(emp.utilities.getDefaultIcon().offset.x, emp.utilities.getDefaultIcon().offset.y));
                    //that2._pixelOffset = new Cesium.Cartesian2(isNaN(that2._actualPosition.x + emp.utilities.getDefaultIcon().offset.x, that2._actualPosition.y + emp.utilities.getDefaultIcon().offset.y  + 5000));
                    that2.imageLoaded = true;
                    that2._alignedAxis = Cesium.Cartesian3.ZERO;
                    that2._verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                    that2._imageIndex = index;
                    that2._ready = true;
                    that2._image = undefined;
                    that2._imageIndexPromise = undefined;
                    
                    makeDirty(that2, Cesium.IMAGE_INDEX_INDEX);
                }).otherwise(function(error) {
                    /*global console*/
                    
                    console.error('Error loading image for billboard: ' + error);
                    that2._imageIndexPromise = undefined;
                    that2.imageLoaded = false;
                });
                    
                    
                    //this._image = new Cesium.ConstantProperty(empGlobe.getProxyUrl() + "?" + entity.billboard.image._value);
                    //end acevedo edit
                    
                    //console.error('Error loading image for billboard: ' + error);
                    //that._imageIndexPromise = undefined;
                });
        };
    
