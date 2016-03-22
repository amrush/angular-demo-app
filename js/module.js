// declare a module
var angularAppModule = angular.module('angularApp', ['ngRoute', 'ui.bootstrap', 'ngSanitize', 'WebStorageModule', 'ngAnimate']);

angularAppModule.run(['$rootScope', function($rootScope) {
            
    $rootScope.pageLoading = false;

}]);

// service
angularAppModule.factory("SlideService", function($q, $timeout, $http, $rootScope){
   return {
       getSlides: function(){
           var deferred = $q.defer();
           $timeout(function(){
               $http.get('http://localhost:3000/data/slides.json').
                  success(function(data, status, headers, config) {
                    $rootScope.pageLoading = false;
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    $rootScope.pageLoading = false;
                    deferred.reject(data);
                });
           },5000);
           console.log(deferred.promise);
           return deferred.promise;
       }
   }
});

// directive
angularAppModule.directive('tabList', function() {
  return {
    scope:{
        tab: '=tabList',
        listOrder: '='
    },
    templateUrl: "../partials/tablist.html"
  };
});

angularAppModule.directive('editModal', function($modal) {
  return {
    scope:{
        item: '=editModal',
        editModalTab: '='
    },
    link : function($scope, element, attrs) {
        element.on('click', function() {
          $scope.open();
        });
    },
    controller: function($scope, $element, $attrs, $modal, $log) {
        $scope.open = function(){
            $scope.modalInstance = $modal.open({
              templateUrl: '../partials/edit.html',
              controller: 'EditController',
              resolve: {
                item: function () {
                    return angular.copy($scope.item);  // using angular.copy() to pass a deep copy of the object to the modal to 
                },                                    // overcome issue of Angular bootstrap ui modal scope binding with parent
                tab:  function(){
                    return angular.copy($scope.editModalTab);
                }
              }
            });

            $scope.modalInstance.result.then(function () {
                $log.info('Modal opened at: ' + new Date());
            }, function () {
               $log.info('Modal dismissed at: ' + new Date());
            });
        };    
    }
  };
});

angularAppModule.directive('deleteModal', function() {
  return {
    scope:{
        item: '=deleteModal',
        deleteModalTab: '='
    },
    link : function($scope, element, attrs) {
        element.on('click', function() {
          $scope.open();
        });
    },
    controller: function($scope, $element, $attrs, $modal, $log) {
        $scope.open = function(){
            var modalInstance = $modal.open({
              templateUrl: '../partials/delete.html',
              controller: 'DeleteController',
              resolve: {
                item: function () {
                    return angular.copy($scope.item);  // using angular.copy() to pass a deep copy of the object to the modal to 
                },                                    // overcome issue of Angular bootstrap ui modal scope binding with parent
                tab:  function(){
                    return angular.copy($scope.deleteModalTab);
                }
              }
            });

            modalInstance.result.then(function () {
                $log.info('Modal opened at: ' + new Date());
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
    }
  };
});

// controllers
angularAppModule.controller('ControllerHome',  ['$scope', '$http',  
    function ($scope, $http) {
        $scope.slideInterval = 5000;
        $scope.noSlidesText = '';
        
        $http.get('http://localhost:3000/data/slides.json').
          success(function(data, status, headers, config) {
            $scope.slides = data.slides;
        }).
        error(function(data, status, headers, config) {
            $scope.noSlidesText = "No slides to display!"
        });
}]);

angularAppModule.controller('ControllerOne',  ['$scope', '$http', 'TabData', 'webStorageService', 
    function ($scope, $http, TabData, webStorageService) {
        webStorageService.clearAll();
        $scope.tabContent = webStorageService.get('localTabContent');
        //console.log("Local: ", $scope.tabContent);
        if($scope.tabContent == null) {
            $scope.tabContent = TabData.tabs;
            webStorageService.set('localTabContent', TabData.tabs);
        }
        $scope.predicate = "date";

        /*$scope.selectTab =  function(currentTab) {
            //console.log("Select Tab fired:");
            //console.log("current tab: ", currentTab);
            //console.log("Tab Content Inside selectTab: ", $scope.tabContent);
            angular.forEach($scope.tabContent, function(tab) {
                console.log("select tab current tab: ", currentTab);
                tab.a = false;
                if (tab.id === currentTab.id) {
                    tab.a = true;
                }
            });

            webStorageService.set('localTabContent', $scope.tabContent);
        };*/

        $scope.$on("tabContentUpdated", function(event, object) {
            $scope.tabObject = object;
            if($scope.tabObject.update){
                $scope.tabContent = webStorageService.get('localTabContent');
                console.log("on update: ",$scope.tabContent)
            }
        });
}]);

angularAppModule.controller('ControllerOne_1',  ['$scope', '$http', '$log',
    function ($scope, $http, $log) {

        var data = [];
  
        // push some dummy data
        for(var i = 0; i < 64; i++) {
            data.push( { name: "item"+i } );
        }

        var createScopeData = function(){
            var begin = ($scope.currentPage - 1) * $scope.itemsPerPage;
            var end = begin + $scope.itemsPerPage;
            return data.slice( begin, end );
        };

        $scope.totalItems = data.length;
        $scope.itemsPerPage = 10;
        $scope.numPages = Math.ceil(data.length / $scope.itemsPerPage);
        $scope.currentPage = 1;
        $scope.maxSize = 5;

        $scope.setPage = function() {
            $scope.dataList = createScopeData();
        };

        $scope.pageChanged = function() {
            $log.log('Page changed to: ' + $scope.currentPage);
        };

        $scope.$watch('currentPage', $scope.setPage);

        $scope.dataListForMoreRows = data;
        $scope.showMoreRows = function() {
            $scope.itemsPerPage = $scope.itemsPerPage + 10;
        };
}]);

angularAppModule.controller('ControllerOne_3',  ['$scope', '$http', '$log',
    function ($scope, $http, $log) {

        var width = 420,
            barHeight = 20;

        var x = d3.scale.linear()
                .range([0, width]);

        var chart = d3.select(".chart")
            .attr("width", width);

        $scope.createBarChart = function() {
            d3.tsv("http://localhost:3000/data/data.tsv", type, function(error, data) {
              x.domain([0, d3.max(data, function(d) { return d.value; })]);

              chart.attr("height", barHeight * data.length);

              var bar = chart.selectAll("g")
                  .data(data)
                .enter().append("g")
                  .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

              bar.append("rect")
                  .attr("width", function(d) { return x(d.value); })
                  .attr("height", barHeight - 1);

              bar.append("text")
                  .attr("x", function(d) { return x(d.value) - 3; })
                  .attr("y", barHeight / 2)
                  .attr("dy", ".35em")
                  .text(function(d) { return d.value; });
            });
        };

        var type = function(d) {
            console.log("d: ", d);
            d.value = +d.value; // coerce to number

            console.log("d.value: ", d.value);
            return d;
        };       

}]);

angularAppModule.controller('ControllerTwo',  ['$scope', '$http', 'SlideData',
    function ($scope, $http, SlideData) {
        console.log("SlideData: ", SlideData);
        $scope.slides = SlideData.slides;
}]);

angularAppModule.controller('ControllerThree',  ['$scope', '$http', 'SlideService', '$rootScope',
    function ($scope, $http, SlideService, $rootScope) {

        $rootScope.pageLoading = true;
        $scope.noSlidesText = '';
        var slidePromise = SlideService.getSlides();

        slidePromise.then(function(response) {
            // success handler
            //console.log("Success Response: ", response);
            $scope.slides = response.slides;
        }, function(response) {
            // error handler
            console.log("Error Response: ", response);
            $scope.noSlidesText = "No slides to display!"
        });

}]);

angularAppModule.controller('EditController',  ['$rootScope', '$scope', '$modalInstance', 'item', 'tab', 'webStorageService', 
    function ($rootScope, $scope, $modalInstance, item, tab, webStorageService) {
        $scope.item = item;
        $scope.tab = tab;
        //console.log("$scope.tab: ", $scope.tab);

        var updateItem = function(){
            var tabContent = webStorageService.get("localTabContent");
            var itemTextUpdated = false;
            angular.forEach(tabContent, function(tab) {
                tab.active = false;
                if (tab.id === $scope.tab.id && tab.contentItems.length) {
                    angular.forEach(tab.contentItems, function(item) {
                        if(item.id === $scope.item.id) {
                            item.text = $scope.item.text;
                            itemTextUpdated = true;
                        }
                    });
                    if(itemTextUpdated){
                        tab.active = true;
                    }
                }
            });
            console.log("On edit:", tabContent);
            webStorageService.set('localTabContent', tabContent);
            $rootScope.$broadcast('tabContentUpdated', {"update": true, "currentTab": $scope.tab});
        };

        $scope.ok = function () {
            updateItem();
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
}]);

angularAppModule.controller('DeleteController',  ['$scope', '$rootScope', '$modalInstance', 'item',  'tab', 'webStorageService',
    function ($scope, $rootScope, $modalInstance, item, tab, webStorageService) {
        $scope.item = item;
        $scope.tab = tab;
        //console.log("$scope.tab: ", $scope.tab);

        var deleteItem =  function(){
            var tabContent = webStorageService.get("localTabContent");
            var itemDeleted = false;
            //console.log(tabContent);
            angular.forEach(tabContent, function(tab, tabKey) {
                tab.active = false;
                if (tab.id === $scope.tab.id && tab.contentItems.length) {
                    angular.forEach(tab.contentItems, function(item, itemKey) {
                        if(item.id === $scope.item.id) {
                            //console.log("itemKey", itemKey);
                            tab.contentItems.splice(itemKey, 1);
                            itemDeleted = true;
                        }
                    });
                    if(itemDeleted){
                        tab.active = true;
                    }
                }
            });

            //console.log(tabContent);

            webStorageService.set('localTabContent', tabContent);
            $rootScope.$broadcast('tabContentUpdated', {"update": true, "currentTab": $scope.tab});
        };

        $scope.ok = function () {
            deleteItem();
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
}]);

// routing
angularAppModule.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
        when('/home', {
        templateUrl: 'views/home.html',
        controller: 'ControllerHome'
    }).
        when('/page11', {
        templateUrl: 'views/page_1_1.html',
        controller: 'ControllerOne',
        resolve: {
            TabData: ['$q', '$http', function($q, $http) {
                var deferred =  $q.defer();

                console.log("deferred ", deferred);

                $http.get('http://localhost:3000/data/tabs.json').
                  success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(data);
                });

                return deferred.promise;

            }]
        }
    }).
        when('/page12', {
        templateUrl: 'views/page_1_2.html',
        controller: 'ControllerOne_1'
    }).
        when('/page13', {
        templateUrl: 'views/page_1_3.html',
        controller: 'ControllerOne_3'
    }).
        when('/page2', {
        templateUrl: 'views/page_2.html',
        controller: 'ControllerTwo',
        resolve: {
            SlideData: ['$q', '$http', function($q, $http) {
                var deferred =  $q.defer();

                console.log("deferred ", deferred);

                $http.get('http://localhost:3000/data/slides.json').
                  success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(data);
                });

                return deferred.promise;

            }]
        }
    }).
        when('/page3', {
        templateUrl: 'views/page_3.html',
        controller: 'ControllerThree'
    }).
    otherwise({redirectTo: '/home'});

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);