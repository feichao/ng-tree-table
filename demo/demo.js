angular.module('MyApp', ['ngMaterial', 'ngMdIcons', 'ngTableTree'])
  .controller('MyController', function ($scope) {
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
  });
