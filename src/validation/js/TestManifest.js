/**
 * The manifest lays out the structure of the tests in the control panel. They should be organized using the following
 * structure
 *
 * Test group : {
 *   id: <unique lower case string>,
 *   title: <very short category title>,
 *   children: [array of tests or child groups]
 * }
 * Test: {
 *   id: <unique lower case string>,
 *   key: <short descriptive text of what is being tested>,
 *   panel: <imported React element>,
 *   tags: [<array of strings>]}
 */

//======================================================================================================================
// Scripting
import FreeformScriptRunner from './components/generalTests/FreeformScriptRunner';
import RecorderPlayback from './components/generalTests/RecorderPlayback';

// General tests
import CreateMapTest from './components/generalTests/CreateMapTest';
import PopulateMapTest from './components/generalTests/PopulateMapTest';
import CreateOverlayTest from './components/generalTests/CreateOverlayTest';
import CreateCameraTest from './components/generalTests/CreateCameraTest';
import CreateAirControlMeasureTest from './components/generalTests/CreateAirControlMeasureTest';
import CreateMilStdSymbolTest from './components/generalTests/CreateMilStdSymbolTest';
import CreatePointTest from './components/generalTests/CreatePointTest';
import CreatePathTest from './components/generalTests/CreatePathTest';
import CreatePolygonTest from './components/generalTests/CreatePolygonTest';
import CreateRectangleTest from './components/generalTests/CreateRectangleTest';
import CreateSquareTest from './components/generalTests/CreateSquareTest';
import CreateCircleTest from './components/generalTests/CreateCircleTest';
import CreateEllipseTest from './components/generalTests/CreateEllipseTest';
import CreateTextTest from './components/generalTests/CreateTextTest';
import CreateKMLTest from './components/generalTests/CreateKMLTest';
import CreateGeoJSONTest from './components/generalTests/CreateGeoJSONTest';
import CreateWMSTest from './components/generalTests/CreateWMSTest';
import CreateWMTSTest from './components/generalTests/CreateWMTSTest';
import CreateKMLLayerTest from './components/generalTests/CreateKMLLayerTest';
import DeleteFeaturesTest from './components/generalTests/DeleteFeaturesTest';

import MultipointPerformanceTest from './components/generalTests/MultipointPerformanceTest';
import SinglepointPerformanceTest from './components/generalTests/SinglepointPerformanceTest';

import CameraEventHandlersTest from './components/generalTests/CameraEventHandlersTest';

// Map Tests
import MapAddEventListenersTest from './components/mapTests/MapAddEventListenersTest';
import MapAddMapServiceTest from './components/mapTests/MapAddMapServiceTest';
import MapAddOverlaysTest from './components/mapTests/MapAddOverlaysTest';
import MapClearSelectedTest from './components/mapTests/MapClearSelectedTest';
import MapDeselectFeatureTest from './components/mapTests/MapDeselectFeatureTest';
import MapDeselectFeaturesTest from './components/mapTests/MapDeselectFeaturesTest';
import MapDrawFeatureTest from './components/mapTests/MapDrawFeatureTest';
import MapDrawFreehandTest from './components/mapTests/MapDrawFreehandTest';
import MapDrawFreehandExitTest from './components/mapTests/MapDrawFreehandExitTest';
import MapEditFeatureTest from './components/mapTests/MapEditFeatureTest';
import MapGetAllOverlaysTest from './components/mapTests/MapGetAllOverlaysTest';
import MapGetBoundsTest from './components/mapTests/MapGetBoundsTest';
import MapGetCameraTest from './components/mapTests/MapGetCameraTest';
import MapGetChildrenTest from './components/mapTests/MapGetChildrenTest';
import SwapMapEngineTest from './components/mapTests/SwapMapEngineTest';
import MapGetBackgroundBrightnessTest from './components/mapTests/MapGetBackgroundBrightnessTest';
import MapGetFarDistanceThresholdTest from './components/mapTests/MapGetFarDistanceThresholdTest';
import MapGetIconSizeTest from './components/mapTests/MapGetIconSizeTest';
import MapGetLookAtTest from './components/mapTests/MapGetLookAtTest';
import MapGetMapServicesTest from './components/mapTests/MapGetMapServicesTest';
import MapGetMidDistanceThresholdTest from './components/mapTests/MapGetMidDistanceThresholdTest';
import MapGetMilStdLabelsTest from './components/mapTests/MapGetMilStdLabelsTest';
import MapGetSelectedTest from './components/mapTests/MapGetSelectedTest';
import MapGetVisibilityTest from './components/mapTests/MapGetVisibilityTest';
import MapIsSelectedTest from './components/mapTests/MapIsSelectedTest';
import MapPurgeTest from './components/mapTests/MapPurgeTest';
import MapSetLookAtTest from './components/mapTests/MapSetLookAtTest';
import MapRemoveEventListenerTest from './components/mapTests/MapRemoveEventListenerTest';
import MapRemoveMapServiceTest from './components/mapTests/MapRemoveMapServiceTest';
import MapRemoveOverlaysTest from './components/mapTests/MapRemoveOverlaysTest';
import MapSelectFeatureTest from './components/mapTests/MapSelectFeatureTest';
import MapSelectFeaturesTest from './components/mapTests/MapSelectFeaturesTest';
import MapSetBackgroundBrightnessTest from './components/mapTests/MapSetBackgroundBrightnessTest';
import MapSetBoundsTest from './components/mapTests/MapSetBoundsTest';
import MapSetCameraTest from './components/mapTests/MapSetCameraTest';
import MapSetFarDistanceThresholdTest from './components/mapTests/MapSetFarDistanceThresholdTest';
import MapSetFreehandStyleTest from './components/mapTests/MapSetFreehandStyleTest';
import MapSetIconSizeTest from './components/mapTests/MapSetIconSizeTest';
import MapSetMidDistanceThresholdTest from './components/mapTests/MapSetMidDistanceThresholdTest';
import MapSetMilStdLabelsTest from './components/mapTests/MapSetMilStdLabelsTest';
import MapSetSelectionStyleTest from './components/mapTests/MapSetSelectionStyleTest';
import MapSetVisibilityTest from './components/mapTests/MapSetVisibilityTest';
import MapZoomToTest from './components/mapTests/MapZoomToTest';
import MapGetInstanceVisibilityTest from './components/mapTests/MapGetInstanceVisibilityTest';
import MapSetMotionLockModeTest from './components/mapTests/MapSetMotionLockModeTest';
import MapGetScreenCaptureTest from './components/mapTests/MapGetScreenCaptureTest';

// Map Conversion Tests
import MapConvertContainerToGeoTest from './components/mapTests/conversion/MapConvertContainerToGeoTest';
import MapConvertGeoToContainerTest from './components/mapTests/conversion/MapConvertGeoToContainerTest';
import MapConvertScreenToGeoTest from './components/mapTests/conversion/MapConvertScreenToGeoTest';
import MapConvertGeoToScreenTest from './components/mapTests/conversion/MapConvertGeoToScreenTest';

// Overlay Tests
import OverlayApplyTest from './components/overlayTests/OverlayApplyTest';
import OverlayAddFeaturesTest from './components/overlayTests/OverlayAddFeaturesTest';
import OverlayGetFeaturesTest from './components/overlayTests/OverlayGetFeaturesTest';
import OverlayAddOverlaysTest from './components/overlayTests/OverlayAddOverlaysTest';
import OverlayRemoveChildOverlaysTest from './components/overlayTests/OverlayRemoveChildOverlaysTest';
import OverlayGetOverlaysTest from './components/overlayTests/OverlayGetOverlaysTest';
import OverlayClearContainerTest from './components/overlayTests/OverlayClearContainerTest';
import OverlayGetChildrenTest from './components/overlayTests/OverlayGetChildrenTest';
import OverlayGetParentsTest from './components/overlayTests/OverlayGetParentsTest';
import OverlayAddEventListenerTest from './components/overlayTests/OverlayAddEventListenerTest';

// Feature Tests
import FeatureAddFeatureTest from './components/featureTests/FeatureAddFeatureTest';
import FeatureClearContainerTest from './components/featureTests/FeatureClearContainerTest';
import FeatureGetChildrenTest from './components/featureTests/FeatureGetChildrenTest';
import FeatureGetParentsTest from './components/featureTests/FeatureGetParentsTest';
import FeatureGetParentFeaturesTest from './components/featureTests/FeatureGetParentFeaturesTest';
import FeatureGetParentOverlaysTest from './components/featureTests/FeatureGetParentOverlaysTest';
import FeatureRemoveFeatureTest from './components/featureTests/FeatureRemoveFeatureTest';
import FeatureAddEventListenerTest from './components/featureTests/FeatureAddEventListenerTest';

// Global Tests
import GlobalFindOverlayTest from './components/globalTests/GlobalFindOverlayTest';
import GlobalFindFeatureTest from './components/globalTests/GlobalFindFeatureTest';
import GlobalFindContainerTest from './components/globalTests/GlobalFindContainerTest';

// Mock Services and Stream
import MockDataStream from './components/mocks/MockDataStream.js';
//======================================================================================================================
// TODO make this immutable
export const TestManifest = [
  {
    id: 'scripting',
    title: 'Scripting',
    children: [
      {id: 'freeformScriptRunner', key: 'Run Freeform Scripts', panel: FreeformScriptRunner},
      {id: 'recorderPlayback', key: 'Recorder Playback', panel: RecorderPlayback}
    ]
  },
  {
    id: 'general',
    title: 'General',
    children: [
      {id: 'populateMapTest', key: 'Populate Map Data', panel: PopulateMapTest},
      {id: 'createMapTest', key: 'Create a Map', panel: CreateMapTest},
      {id: 'createOverlayTest', key: 'Create Overlays', panel: CreateOverlayTest},
      {id: 'createCameraTest', key: 'Create Cameras', panel: CreateCameraTest},
      {id: 'createAirControlMeasureTest', key: 'Create Air Control Measure', panel: CreateAirControlMeasureTest, tags: ['feature']},
      {id: 'createMilStdSymbolTest', key: 'Create Mil. Std. Symbols', panel: CreateMilStdSymbolTest, tags: ['feature']},
      {id: 'createCircleTest', key: 'Create Circles', panel: CreateCircleTest, tags: ['feature']},
      {id: 'createEllipseTest', key: 'Create Ellipse', panel: CreateEllipseTest, tags: ['feature']},
      {id: 'createPointTest', key: 'Create Points', panel: CreatePointTest, tags: ['feature']},
      {id: 'createPathTest', key: 'Create Paths', panel: CreatePathTest, tags: ['feature']},
      {id: 'createPolygonTest', key: 'Create Polygons', panel: CreatePolygonTest, tags: ['feature']},
      {id: 'createRectangleTest', key: 'Create Rectangles', panel: CreateRectangleTest, tags: ['feature']},
      {id: 'createSquareTest', key: 'Create Squares', panel: CreateSquareTest, tags: ['feature']},
      {id: 'createTextTest', key: 'Create Text', panel: CreateTextTest, tags: ['feature']},
      {id: 'createKMLTest', key: 'Create KML', panel: CreateKMLTest, tags: ['feature']},
      {id: 'createGeoJSONTest', key: 'Create GeoJSON', panel: CreateGeoJSONTest, tags: ['feature']},
      {id: 'createWMSTest', key: 'Create WMS', panel: CreateWMSTest, tags: ['service']},
      {id: 'createWMTSTest', key: 'Create WMTS', panel: CreateWMTSTest, tags: ['service']},
      {id: 'createKMLLayerTest', key: 'Create KML Layer', panel: CreateKMLLayerTest, tags: ['service']},
      {id: 'createMultiPointPerformanceTest', key: 'Multipoint Performance', panel: MultipointPerformanceTest, tags: ['feature', 'performance']},
      {id: 'createSinglePointPerformanceTest', key: 'Singlepoint Performance', panel: SinglepointPerformanceTest, tags: ['feature', 'performance']},
      {id: 'deleteFeaturesTest', key: 'Delete Features', panel: DeleteFeaturesTest},
      {id: 'cameraEventHandlersTest', key: 'Camera Events', panel: CameraEventHandlersTest, tags: ['add', 'remove']}
    ]
  },
  {
    id: 'map',
    title: 'Map', children: [
    {
      id: 'map.conversion', title: 'Conversion', children: [
      {
        id: 'mapConvertGeoToScreenTest',
        key: 'geoToScreen',
        panel: MapConvertGeoToScreenTest,
        tags: ['convert', 'conversion', 'translate', 'pixel']
      },
      {
        id: 'mapConvertGeoToContainerTest',
        key: 'geoToContainer',
        panel: MapConvertGeoToContainerTest,
        tags: ['convert', 'conversion', 'translate', 'pixel']
      },
      {
        id: 'mapConvertScreenToGeoTest',
        key: 'screenToGeo',
        panel: MapConvertScreenToGeoTest,
        tags: ['convert', 'conversion', 'translate', 'pixel']
      },
      {
        id: 'mapConvertContainerToGeoTest',
        key: 'containerToGeo',
        panel: MapConvertContainerToGeoTest,
        tags: ['convert', 'conversion', 'translate', 'pixel']
      }
    ]
    },
    {id: 'mapAddEventListenerTest', key: 'addEventListener', panel: MapAddEventListenersTest},
    {id: 'mapAddMapServiceTest', key: 'addMapService', panel: MapAddMapServiceTest, tags: ['wms']},
    {id: 'mapAddOverlaysTest', key: 'addOverlays', panel: MapAddOverlaysTest},
    {id: 'mapClearSelectedTest', key: 'clearSelected', panel: MapClearSelectedTest, tags: ['select']},
    {id: 'mapDeselectFeatureTest', key: 'deselectFeature', panel: MapDeselectFeatureTest, tags: ['select']},
    {id: 'mapDeselectFeaturesTest', key: 'deselectFeatures', panel: MapDeselectFeaturesTest, tags: ['select']},
    {id: 'mapDrawFeatureTest', key: 'drawFeature', panel: MapDrawFeatureTest},
    {id: 'mapDrawFreehandTest', key: 'drawFreehand', panel: MapDrawFreehandTest},
    {id: 'mapDrawFreehandExitTest', key: 'drawFreehandExit', panel: MapDrawFreehandExitTest},
    {id: 'mapEditFeatureTest', key: 'editFeature', panel: MapEditFeatureTest},
    {id: 'mapGetAllOverlaysTest', key: 'getAllOverlays', panel: MapGetAllOverlaysTest},
    {id: 'mapGetBackgroundBrightnessTest', key: 'getBackgroundBrightness', panel: MapGetBackgroundBrightnessTest},
    {id: 'mapGetBoundsTest', key: 'getBounds', panel: MapGetBoundsTest, tags: ['view']},
    {id: 'mapGetCameraTest', key: 'getCamera', panel: MapGetCameraTest, tags: ['view']},
    {id: 'mapGetChildrenTest', key: 'getChildren', panel: MapGetChildrenTest, tags: ['overlays']},
    {id: 'mapGetFarDistanceThresholdTest', key: 'getFarDistanceThreshold', panel: MapGetFarDistanceThresholdTest},
    {id: 'mapGetIconSizeTest', key: 'getIconSize', panel: MapGetIconSizeTest},
    {id: 'mapGetLookAtTest', key: 'getLookAt', panel: MapGetLookAtTest, tags: ['view']},
    {id: 'mapGetMapServicesTest', key: 'getMapServices', panel: MapGetMapServicesTest},
    {id: 'mapGetMidDistanceThresholdTest', key: 'getMidDistanceThreshold', panel: MapGetMidDistanceThresholdTest},
    {id: 'mapGetMilStdLabelsTest', key: 'getMilStdLabelsTest', panel: MapGetMilStdLabelsTest},
    {id: 'mapGetSelectedTest', key: 'getSelectedTest', panel: MapGetSelectedTest, tags: ['select']},
    {id: 'mapGetVisibilityTest', key: 'getVisibility', panel: MapGetVisibilityTest},
    {id: 'mapIsSelectedTest', key: 'isSelectedTest', panel: MapIsSelectedTest, tags: ['select']},
    {id: 'mapGetInstanceVisibilityTest', key: 'getInstanceVisibility', panel: MapGetInstanceVisibilityTest},
    {id: 'mapPurgeTest', key: 'purge', panel: MapPurgeTest},
    {id: 'mapRemoveEventListenerTest', key: 'removeEventListener', panel: MapRemoveEventListenerTest},
    {id: 'mapRemoveMapServiceTest', key: 'removeMapServices', panel: MapRemoveMapServiceTest, tags: ['wms']},
    {id: 'mapRemoveOverlaysTest', key: 'removeOverlays', panel: MapRemoveOverlaysTest},
    {id: 'mapSelectFeatureTest', key: 'selectFeature', panel: MapSelectFeatureTest, tags: ['select']},
    {id: 'mapSelectFeaturesTest', key: 'selectFeatures', panel: MapSelectFeaturesTest, tags: ['select']},
    {id: 'mapSetBackgroundBrightnessTest', key: 'setBackgroundBrightness', panel: MapSetBackgroundBrightnessTest},
    {id: 'mapSetBoundsTest', key: 'setBounds', panel: MapSetBoundsTest, tags: ['view']},
    {id: 'mapSetCameraTest', key: 'setCamera', panel: MapSetCameraTest, tags: ['view']},
    {id: 'mapSetFarDistanceThresholdTest', key: 'setFarDistanceThreshold', panel: MapSetFarDistanceThresholdTest},
    {id: 'mapSetFreehandStyleTest', key: 'setFreehandStyle', panel: MapSetFreehandStyleTest},
    {id: 'mapSetLookAtTest', key: 'setLookAt', panel: MapSetLookAtTest, tags: ['view']},
    {id: 'mapSetIconSizeTest', key: 'setIconSize', panel: MapSetIconSizeTest},
    {id: 'mapSetMidDistanceThresholdTest', key: 'setMidDistanceThreshold', panel: MapSetMidDistanceThresholdTest},
    {id: 'mapSetMilStdLabelsTest', key: 'setMilStdLabels', panel: MapSetMilStdLabelsTest},
    {id: 'mapSetMotionLockModeTest', key: 'setMotionLockMode', panel: MapSetMotionLockModeTest, tags: ['unlock']},
    {id: 'mapSetSelectionStyleTest', key: 'setSelectionStyle', panel: MapSetSelectionStyleTest, tags: ['select']},
    {id: 'mapSetVisibilityTest', key: 'setVisibility', panel: MapSetVisibilityTest},
    {id: 'mapSwapMapEngineTest', key: 'swapMapEngine', panel: SwapMapEngineTest},
    {id: 'mapZoomToTest', key: 'zoomTo', panel: MapZoomToTest, tags: ['view']},
    {id: 'mapGetScreenCaptureTest', key: 'capture screenshot', panel: MapGetScreenCaptureTest, tags: ['capture', 'screenshot']}
  ]
  },
  {
    id: 'overlays',
    title: 'Overlay', children: [
    {id: 'overlayApplyTest', key: 'apply', panel: OverlayApplyTest},
    {id: 'overlayAddFeaturesTest', key: 'addFeatures', panel: OverlayAddFeaturesTest},
    {id: 'overlayGetFeaturesTest', key: 'getFeatures', panel: OverlayGetFeaturesTest},
    {id: 'deleteFeaturesTest', key: 'removeFeatures', panel: DeleteFeaturesTest},
    {id: 'overlayAddOverlaysTest', key: 'addOverlays', panel: OverlayAddOverlaysTest},
    {id: 'overlayGetOverlaysTest', key: 'getOverlays', panel: OverlayGetOverlaysTest},
    {id: 'overlayRemoveOverlaysTest', key: 'removeOverlays', panel: OverlayRemoveChildOverlaysTest},
    {id: 'overlayClearContainerTest', key: 'clearContainer', panel: OverlayClearContainerTest},
    {id: 'overlayGetChildrenTest', key: 'getChildren', panel: OverlayGetChildrenTest, tags: ['features', 'overlays']},
    {id: 'overlayGetParentsTest', key: 'getParents', panel: OverlayGetParentsTest, tags: ['overlays']},
    {id: 'overlayAddEventListenerTest', key: 'addEventListener', panel: OverlayAddEventListenerTest, tags: ['overlays']}
  ]
  },
  {
    id: 'features',
    title: 'Features', children: [
    {id: 'featureAddFeatureTest', key: 'addFeature', panel: FeatureAddFeatureTest},
    {id: 'featureClearContainerTest', key: 'clearContainer', panel: FeatureClearContainerTest},
    {id: 'featureGetChildrenTest', key: 'getChildren', panel: FeatureGetChildrenTest, tags: ['features']},
    {id: 'featureGetParentsTest', key: 'getParents', panel: FeatureGetParentsTest, tags: ['features', 'overlays']},
    {id: 'featureGetParentFeaturesTest', key: 'getParentFeatures', panel: FeatureGetParentFeaturesTest},
    {id: 'featureGetParentOverlaysTest', key: 'getParentOverlays', panel: FeatureGetParentOverlaysTest},
    {id: 'featureRemoveFeatureTest', key: 'removeFeatures', panel: FeatureRemoveFeatureTest},
    {id: 'featureAddEventListenerTest', key: 'addEventListener', panel: FeatureAddEventListenerTest, tags: ['features']}
  ]
  },
  {
    id: 'global',
    title: 'Global', children: [
    {id: 'globalFindOverlayTest', key: 'findOverlay', panel: GlobalFindOverlayTest, tags: ['search']},
    {id: 'globalFindFeatureTest', key: 'findFeature', panel: GlobalFindFeatureTest, tags: ['search']},
    {id: 'globalFindContainerTest', key: 'findContainer', panel: GlobalFindContainerTest, tags: ['search']}
  ]
  },
  {
    id: 'mocks',
    title: 'Mocks and Services', children: [
    {id: 'mockdatastream', key: 'Mock Data Stream', panel: MockDataStream, tags: ['data', 'stream', 'service']}
  ]
  }
];

/**
 * Helper method for finding tests in the manifest
 */
export const findTestInManifest = (id) => {
  const tests = [],
    subGroups = [...TestManifest], // Make sure to use a copy
    searchedGroups = [];

  while (subGroups.length) {
    _.forEach(subGroups, group => {
      // Mark the group as searched
      searchedGroups.push(group);

      // Add all tests to the test list
      let filter = _.reject(group.children, child => {
        return child.hasOwnProperty('children');
      });
      _.forEach(filter, test => {
        tests.push(test);
      });

      // Add any found sub-groups to the list
      let newGroups = _.filter(group.children, child => {
        return child.hasOwnProperty('children');
      });
      _.forEach(newGroups, gr => {
        subGroups.push(gr);
      });
    });

    // Remove any visited groups
    _.pullAll(subGroups, searchedGroups);
  }
  return _.find(tests, {id: id});
};
