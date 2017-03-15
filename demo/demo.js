angular.module('MyApp', ['ngMaterial', 'ngMdIcons', 'ngTableTree'])
  .controller('MyController', function ($scope, $timeout) {
    $scope.tree = [{
      name: 'frank',
      age: 34,
      address: 'Kezhu Road 192',
      contact: '13600010001',
      children: [{
        name: 'frank a',
        age: 34,
        address: 'Kezhu Road 192',
        contact: '13600010002'
      }, {
        name: 'frank b',
        age: 34,
        address: 'Kezhu Road 192',
        contact: '13600010003',
        children: [{
          name: 'frank ba',
          age: 34,
          address: 'Kezhu Road 192',
          contact: '13600010004'
        }, {
          name: 'frank bb',
          age: 34,
          address: 'Kezhu Road 192',
          contact: '13600010005'
        }, {
          name: 'frank bc',
          age: 34,
          address: 'Kezhu Road 192',
          contact: '13600010006'
        }]
      }, {
        name: 'frank c',
        age: 34,
        address: 'Kezhu Road 192',
        contact: '13600010003'
      }]
    }, {
      name: 'frank d',
      age: 34,
      address: 'Kezhu Road 192',
      contact: '13600010007'
    }];

    $scope.tree2 = angular.copy($scope.tree);

    $scope.addAge = function(event, branch) {
      branch.age += 1;
    };

    $scope.insertRow = function(event, branch) {
      $scope.tree[0].children.push({
        name: 'frank cc',
        age: 44,
        address: 'Kezhu Road 192',
        contact: '13600010009'
      });
    };

    $scope.insertRow2 = function(event, branch) {
      $scope.tree2[0].children.push({
        name: 'frank cc',
        age: 44,
        address: 'Kezhu Road 192',
        contact: '13600010009'
      });
    };
  });
