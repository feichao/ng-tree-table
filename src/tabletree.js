(function () {
  'use strict';

  var SCOPE_HINT = '\\*\\*';
  var EXPAND_INTENT = 10; // 'px'
  var DEBUG = false;

  function log(msg) {
    if (DEBUG) {
      console.log(msg);
    }
  }

  function getOriginalTtTemplate(tbody) {
    return findTtTemplate(tbody.find('tr'));
  }

  function findMatchAttrTemplate(elements, attr) {
    var length = elements.length;
    for (var i = 0; i < length; i++) {
      var trEle = angular.element(elements[i]);
      if (trEle.attr(attr) !== undefined) {
        return elements[i];
      }
    }
    return elements[0];
  }

  function findTtTemplate(trs) {
    return findMatchAttrTemplate(trs, 'tt-template');
  }

  function findTdExpand(tds) {
    return findMatchAttrTemplate(tds, 'tt-expand');
  }

  function getJqliteHtml(element) {
    if (element instanceof angular.element) {
      return element[0].outerHTML;
    }
  }

  function getArray(array) {
    return Array.isArray(array) ? array : [];
  }

  angular
    .module('ngTableTree', [])
    .directive('tableTree', tableTree);

  function tableTree($interval) {
    return {
      restrict: 'A',
      scope: true,
      template: function (element) {
        var thNum = element.find('thead').find('th').length;
        var tbody = element.addClass('tt-table').find('tbody');
        var trTemplate = getOriginalTtTemplate(tbody);
        var trTemplateElement = angular.element(trTemplate);
        tbody.append(getTreeTemplate(trTemplateElement));
        tbody.append('<tr ng-if="treesAll.length > 0"><td class="load-more" colspan="' + (thNum - 1) + '" ng-click="loadMore()">Load more..</td><td class="load-all" ng-click="loadAll()">Load all...</td></tr>');
        tbody.append('<tr ng-if="trees.length <= 0"><td class="no-items" colspan="' + thNum + '">No Items</td></tr>');
        trTemplateElement.remove();
        return getJqliteHtml(element);
      },
      compile: compile
    };

    function compile(tElement, tAttr) {
      return function ($scope, element, attr) {
        // whether deep watch the collection
        $scope.deepWatch = !!$scope.$eval(attr.deepWatch);
        $scope.maxRows = $scope.$eval(attr.maxRows);

        // save tree status
        $scope.trees = [];
        $scope.toggleExpand = function (index) {
          $scope.trees.filter(function(tree) {
            return tree.__$parentIndex === index;
          }).forEach(function(tree) {
            tree.__$isInitShow = true;
          });
          $scope.trees[index].__$isExpand = !$scope.trees[index].__$isExpand;
        };
        $scope.isTrShow = function (trees, index) {
          if (!trees[index]) {
            return true;
          }

          var i = trees[index].__$parentIndex;
          while (typeof i === 'number' && i >= 0) {
            if (!trees[i].__$isExpand) {
              return false;
            }
            i = trees[i].__$parentIndex;
          }
          return true;
        };
        $scope.clear = function() {
          $interval.cancel($scope.loadTimer);
        };
        $scope.pushTo = function(arr) {
          var length = arr.length;
          for(var i = 0; i < length; i++) {
            $scope.trees.push(arr[i]);
          }
        };
        $scope.loadMore = function() {
          $scope.pushTo($scope.treesAll.splice(0, $scope.maxRows));
        };
        $scope.loadAll = function() {
          $scope.loadTimer = $interval(function() {
            $scope.pushTo($scope.treesAll.splice(0, 10));
            if($scope.treesAll.length <= 0) {
              $scope.clear();
            }
          }, 20);
        };
        $scope.$on('$destroy', function() {
          $scope.clear();
        });

        $scope.$watch(function () {
          return $scope.$eval(attr.tableTree);
        }, function (tableTree) {
          $scope.clear();

          $scope.treesAll = [];
          $scope.trees = [];
          $scope.expandIndent = $scope.$eval(attr.expandIndent);
          $scope.indent = angular.isNumber($scope.expandIndent) ? $scope.expandIndent : EXPAND_INTENT;

          $scope.initExpand = $scope.$eval(attr.initExpand);
          $scope.initExpand = $scope.initExpand;

          getTreeStatus(null, getArray(tableTree));
          if(!angular.isNumber($scope.maxRows)) {
            $scope.loadAll();
          } else {
            $scope.loadMore();
          }
          log($scope.trees);
        }, $scope.deepWatch);

        function getTrDepth(index) {
          var i = $scope.treesAll[index].__$parentIndex;
          var depth = 0;
          while (typeof i === 'number' && i >= 0) {
            depth++;
            i = $scope.treesAll[i].__$parentIndex;
          }

          return depth;
        };

        function saveBranchBlock(parentIndex, branch) {
          var index = $scope.treesAll.length;
          $scope.treesAll.push(angular.extend({
            __$index: index,
            __$parentIndex: parentIndex
          }, branch));

          var depth = getTrDepth(index);
          $scope.treesAll[index].__$isExpand = angular.isNumber($scope.initExpand) ? depth < $scope.initExpand - 1 : $scope.initExpand;
          $scope.treesAll[index].__$isInitShow = $scope.isTrShow($scope.treesAll, index);
          $scope.treesAll[index].__$depth = depth;
          return index;
        }

        function getTreeStatus(parentId, children) {
          var length = children.length;
          var branch;
          var branchIndex;
          var result = '';
          for (var i = 0; i < length; i++) {
            branch = children[i];
            branchIndex = saveBranchBlock(parentId, branch);
            getTreeStatus(branchIndex, getArray(branch.children));
          }
        }
      };
    }

    function getTreeTemplate(trTemplateElement) {
      var ttTemplateStr;

      trTemplateElement.attr('ng-repeat', 'tree in trees track by tree.__$index')
        .attr('ng-if', 'tree.__$isInitShow')
        .attr('ng-show', 'isTrShow(trees, tree.__$index)');

      var tdExpandElement = findTdExpand(trTemplateElement.find('td'));
      var tdExpandJQElement = angular.element(tdExpandElement);
      tdExpandJQElement.html(getJqliteHtml(getExpandTemplate(tdExpandJQElement)));

      ttTemplateStr = getJqliteHtml(trTemplateElement).replace(/\*\*/g, 'tree');
      log(ttTemplateStr);

      return ttTemplateStr;
    }

    function getExpandTemplate(tdElement) {
      var isShow = 'tree.children.length > 0';
      var isExpand = 'tree.__$isExpand && ' + isShow;
      var ngClass = isExpand + ' ? \'expanded\' : \'\'';
      var expandIcon = angular.element('<i></i>')
      expandIcon.attr('ng-class', ngClass)
        .attr('ng-style', '{ visibility: ' + isShow + ' ? \'\' : \'collapse\', marginLeft: tree.__$depth * indent + \'px\'}')
        .attr('ng-click', 'toggleExpand(tree.__$index)')
        .addClass('expand-icon');

      return angular.element('<div></div>')
        .append(expandIcon)
        .append(tdElement.addClass('tt-expand-td').contents())
        .attr('layout', 'row')
        .attr('layout-align', 'start center');
    }
  }
})();
