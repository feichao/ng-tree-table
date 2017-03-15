(function () {
  'use strict';

  var SCOPE_HINT = '\\*\\*';
  var EXPAND_INTENT = 10; // 'px'
  var DEBUG = false;

  var TT_TEMPLATE_ID = 'tt-template-id';
  var originalTtTemplates = {};
  var id = 0;

  function log(msg) {
    if(DEBUG) {
      console.log(msg);
    }
  }

  function generateId() {
    return id++;
  }

  function saveOriginalTtTemplate(tbody) {
    clearOriginalTtTemplate();

    var id;
    var ttTemplate = findTtTemplate(tbody.find('tr'));
    if (ttTemplate) {
      id = generateId();
      originalTtTemplates[id] = ttTemplate;
      return {
        ttTemplateId: id,
        ttTemplate: ttTemplate
      };
    }
    return undefined;
  }

  function clearOriginalTtTemplate() {
    var newOriginalTtTemplates = {};
    var tables = angular.element(document.body).find('table');
    angular.forEach(tables, function(table) {
      var table = angular.element(table);
      var id = table.attr(TT_TEMPLATE_ID);
      if(originalTtTemplates[id]) {
        newOriginalTtTemplates[id] = originalTtTemplates[id];
      }
    });

    originalTtTemplates = newOriginalTtTemplates;
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

  /**
   * @ngInject
   */
  function tableTree($compile, $interpolate) {
    return {
      restrict: 'A',
      scope: {
        tableTree: '=',
        initExpand: '@',
        expandIndent: '@',
        deepWatch: '@'
      },
      template: function(element) {
        var tbody = element.addClass('tt-table').find('tbody');
        var saveResult = saveOriginalTtTemplate(tbody);
        if(!saveResult) {
          return;  
        }

        log(originalTtTemplates);

        angular.element(saveResult.ttTemplate).remove();
        return getJqliteHtml(element.attr(TT_TEMPLATE_ID, saveResult.ttTemplateId));  
      },
      // priority: 1001,
      // terminal: true,
      compile: compile
    };

    function compile(tElement, tAttr) {
      var thNum = tElement.find('thead').find('th').length;
      var tbody = tElement.addClass('tt-table').find('tbody');
      var ttTemplateDom = originalTtTemplates[tElement.attr(TT_TEMPLATE_ID)];

      return function ($scope, element, attr) {
        log('start post link');
        var ttTemplateElement = angular.element(ttTemplateDom);
        var templateStr = getTreeTemplate();
        var treesCompileScope;

        // whether deep watch the collection
        $scope.deepWatch = $scope.deepWatch ? angular.fromJson($scope.deepWatch) : true;

        // save tree status
        $scope.trees = [];
        $scope.toggleExpand = function (index) {
          $scope.trees[index].__$isExpand = !$scope.trees[index].__$isExpand;
        };
        $scope.isTrShow = function (index) {
          if(!$scope.trees[index]) {
            return true;
          }

          var i = $scope.trees[index].__$parentIndex;
          while(typeof i === 'number' && i >= 0) {
            if(!$scope.trees[i].__$isExpand) {
              return false;
            }
            i = $scope.trees[i].__$parentIndex;
          }
          return true;
        };

        $scope.$watch('tableTree', function () {
          $scope.trees = [];
          $scope.indent = angular.isDefined($scope.expandIndent) ? $scope.expandIndent : EXPAND_INTENT;
          $scope.initExpand = $scope.initExpand ? angular.fromJson($scope.initExpand) : true;

          getTreeStatus(null, getArray($scope.tableTree));
          log($scope.trees);
          if (!$scope.trees.length) {
            return tbody.html('<tr><td colspan="' + thNum + '">No Items</td></tr>');
          }

          if(treesCompileScope) {
            treesCompileScope.$destroy();
          }

          treesCompileScope = getNewScope();
          var compileStr = $compile(templateStr)(treesCompileScope);
          var templateElement = angular.element(compileStr);
          tbody.html('').append(templateElement);
        }, $scope.deepWatch);

        function getNewScope() {
          var scope = $scope.$parent.$new();
          for(var key in $scope) {
            if($scope.hasOwnProperty(key) && key.charAt(0) !== '$') {
              scope[key] = $scope[key];
            }
          }
          return scope;
        }

        function getTrDepth(index) {
          var i = $scope.trees[index].__$parentIndex;
          var depth = 0;
          while(typeof i === 'number' && i >= 0) {
            depth++;
            i = $scope.trees[i].__$parentIndex;
          }

          return depth;
        };

        function saveBranchBlock(parentIndex, branch) {
          var index = $scope.trees.length;
          $scope.trees.push(angular.extend({
            __$index: index,
            __$parentIndex: parentIndex,
            __$isExpand: $scope.initExpand
          }, branch));

          $scope.trees[index].__$depth = getTrDepth(index);
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

        function getTreeTemplate() {
          var ttTemplateStr;

          ttTemplateElement.attr('ng-repeat', 'tree in trees')
            .attr('ng-show', 'isTrShow(tree.__$index)');

          var tdExpandElement = findTdExpand(ttTemplateElement.find('td'));
          var tdExpandJQElement = angular.element(tdExpandElement);
          tdExpandJQElement.html(getJqliteHtml(getExpandTemplate(tdExpandJQElement)));

          ttTemplateStr = getJqliteHtml(ttTemplateElement).replace(/\*\*/g, 'tree');
          log(ttTemplateStr);

          return ttTemplateStr;
        }

        function getExpandTemplate(tdElement) {
          var isShow =  'tree.children.length > 0';
          var isExpand = 'tree.__$isExpand && ' + isShow;
          var icon = isExpand + ' ? \'keyboard_arrow_down\' : \'keyboard_arrow_right\'';
          var expandIcon = angular.element('<ng-md-icon size="24"></ng-md-icon>')
          expandIcon.attr('icon', '{{' + icon + '}}')
            .attr('ng-style', '{ visibility: ' + isShow + ' ? \'\' : \'collapse\', marginLeft: tree.__$depth * indent + \'px\'}')
            .attr('ng-click', 'toggleExpand(tree.__$index)')
            .addClass('expand-icon');

          return angular.element('<div></div>')
            .append(expandIcon)
            .append(tdElement.addClass('tt-expand-td').contents())
            .attr('layout', 'row')
            .attr('layout-align', 'start center');
        }
      };
    }
  }
})();
