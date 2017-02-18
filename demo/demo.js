angular.module('MyApp', ['ngMaterial', 'ngMdIcons', 'ngTableTree'])
  .controller('MyController', function($scope) {
    $scope.tree = [{
      'children': [{
        'children': [{
          'children': [{
            'children': [{
              'duration': 5005507,
              'id': '22259474470f92c8',
              'name': 'jedis-normal',
              'parentId': '49251ba0bbeb7c23',
              'progress': 94.0178,
              'timestamp': '1486522925570000',
              'traceId': 'fa81ae5e7b6f877f',
              'children': [{
                'duration': 5005507,
                'id': '22259474470f92c8',
                'name': 'jedis-normal',
                'parentId': '49251ba0bbeb7c23',
                'progress': 94.0178,
                'timestamp': '1486522925570000',
                'traceId': 'fa81ae5e7b6f877f',
                'children': [{
                  'duration': 5005507,
                  'id': '22259474470f92c8',
                  'name': 'jedis-normal',
                  'parentId': '49251ba0bbeb7c23',
                  'progress': 94.0178,
                  'timestamp': '1486522925570000',
                  'traceId': 'fa81ae5e7b6f877f'
                }],
              }],
            }],
            'duration': 5009120,
            'id': '49251ba0bbeb7c23',
            'name': 'get_/jedis-normal',
            'parentId': '6dd5d2bf9041a5eb',
            'progress': 94.08567,
            'timestamp': '1486522925569000',
            'traceId': 'fa81ae5e7b6f877f'
          }],
          'duration': 5011852,
          'id': '6dd5d2bf9041a5eb',
          'name': 'callme1',
          'parentId': '784097037f85455d',
          'progress': 94.136986,
          'timestamp': '1486522925566000',
          'traceId': 'fa81ae5e7b6f877f'
        }, {
          'children': [{
            'duration': 105346,
            'id': 'cfc2ccdf81b3a08f',
            'name': 'callme5',
            'parentId': '4fd8c962cec839dc',
            'progress': 1.9787006,
            'timestamp': '1486522930579000',
            'traceId': 'fa81ae5e7b6f877f'
          }],
          'duration': 309145,
          'id': '4fd8c962cec839dc',
          'name': 'callme2',
          'parentId': '784097037f85455d',
          'progress': 5.8066316,
          'timestamp': '1486522930578000',
          'traceId': 'fa81ae5e7b6f877f'
        }],
        'duration': 5322414,
        'id': '784097037f85455d',
        'name': 'callme0',
        'parentId': 'e038b25ba938a1a2',
        'progress': 99.97023,
        'timestamp': '1486522925566000',
        'traceId': 'fa81ae5e7b6f877f'
      }],
      'duration': 5323999,
      'id': 'e038b25ba938a1a2',
      'name': 'get_/testdapper',
      'progress': 100.0,
      'timestamp': '1486522925565000',
      'traceId': 'fa81ae5e7b6f877f'
    }];

    $scope.testClick = function(event, data) {
      console.log(data);
    };
  });
