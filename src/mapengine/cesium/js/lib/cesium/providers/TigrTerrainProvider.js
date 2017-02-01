// COPYRIGHT 2013 GENERAL DYNAMICS.
// This computer software is submitted with unlimited rights to the
// U.S. Government under Contract No. HR0011-10-C-0030.

var TigrTerrainProvider = function TigrTerrainProvider(description)
{
	if (typeof description === 'undefined' || typeof description.url === 'undefined')
	{
		throw new DeveloperError('description.url is required.');
	}

	this._url = description.url;
	this._proxy = description.proxy;

	this.tilingScheme = new Cesium.GeographicTilingScheme({
		numberOfLevelZeroTilesX: 2,
		numberOfLevelZeroTilesY: 1
	});

	this._heightmapWidth = 65;
	this._levelZeroMaximumGeometricError = Cesium.TerrainProvider.getEstimatedLevelZeroGeometricErrorForAHeightmap(this.tilingScheme.ellipsoid, this._heightmapWidth, this.tilingScheme.getNumberOfXTilesAtLevel(0));

	this._terrainDataStructure = {
		heightScale: 1,
		heightOffset: -1000.0,
		elementsPerHeight: 1,
		stride: 1,
		elementMultiplier: 256.0,
		isBigEndian: false
	};

	this.errorEvent = new Cesium.Event();

	this.credit = undefined;
	if (typeof description.credit !== 'undefined')
	{
	    this.credit = credit;
	}
};

TigrTerrainProvider.prototype.requestTileGeometry = function (x, y, level, throttleRequests)
{
	var yTiles = this.tilingScheme.getNumberOfYTilesAtLevel(level);
	var url = this._url + '/' + level + '/' + x + '/' + (yTiles - y - 1) + '.terrain';

	var proxy = this._proxy;
	if (typeof proxy !== 'undefined')
	{
		url = proxy.getURL(url);
	}

	var promise;

	throttleRequests = Cesium.defaultValue(throttleRequests, true);
	if (throttleRequests)
	{
		promise = Cesium.throttleRequestByServer(url, Cesium.loadArrayBuffer);
		if (typeof promise === 'undefined')
		{
			return undefined;
		}
	} else
	{
		promise = Cesium.loadArrayBuffer(url);
	}

	var that = this;
	return Cesium.when(promise, function (buffer)
	{
		var heightBuffer = new Uint16Array(buffer, 0, that._heightmapWidth * that._heightmapWidth);
		//g_debug(heightBuffer[0] + ',' + heightBuffer[2]);
		return new Cesium.HeightmapTerrainData({
			buffer: heightBuffer,
			childTileMask: 15,
			//waterMask: new Uint8Array(buffer, heightBuffer.byteLength + 1, buffer.byteLength - heightBuffer.byteLength - 1),
			width: that._heightmapWidth,
			height: that._heightmapWidth,
			structure: that._terrainDataStructure
		});
	});
};

TigrTerrainProvider.prototype.errorEvent = function ()
{
	return this.errorEvent;
};

TigrTerrainProvider.prototype.getLevelMaximumGeometricError = function (level)
{
	return this._levelZeroMaximumGeometricError / (1 << level);
};

TigrTerrainProvider.prototype.credit = function ()
{
	return this.credit;
};

TigrTerrainProvider.prototype.tilingScheme = function ()
{
	return this.tilingScheme;
};

TigrTerrainProvider.prototype.hasWaterMask = function ()
{
	return false;
};

TigrTerrainProvider.prototype.ready = function ()
{
	return true;
};

TigrTerrainProvider.prototype.getTileDataAvailable = function (x, y, level, throttleRequests)
{
    return undefined;
};

