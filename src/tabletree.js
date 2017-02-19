(function () {
  'use strict';

  var SCOPE_HINT = '\\*\\*';
  var EXPAND_INTEND = 10; // 'px'
  var originalTtTemplates = {};

  var id = 0;
  function generateId() {
    return id++;
  }

  function saveOriginalTtTemplate(tbody) {
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
    if(element instanceof angular.element) {
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
  function tableTree($compile) {
    return {
      restrict: 'A',
      scope: {
        tableTree: '=',
        initExpand: '@'
      },
      template: function (element) {
        var tbody = element.find('tbody');
        var result = saveOriginalTtTemplate(tbody);
        if(!result) {
          return;  
        }

        angular.element(result.ttTemplate).remove();
        return getJqliteHtml(element.attr('tt-template-id', result.ttTemplateId));  
      },
      link: postLink
    };

    function postLink($scope, element, attr) {
      // console.log('start post link');

      var tbody = element.addClass('tt-table').find('tbody');
      var ttTemplateElement = angular.element(originalTtTemplates[element.attr('tt-template-id')]);

      // 保存状态
      $scope.trees = {};
      $scope.isExpand = function(id) {
        $scope.trees[id].isExpand = !$scope.trees[id].isExpand;
      };

      $scope.$watch('tableTree', function () {
        $scope.initExpand = $scope.initExpand === 'false' ? false : true;

        var templateStr = getTreeTemplate(null, getArray($scope.tableTree));
        // console.log(templateStr);

        var scope = getNewScope();
        scope.trees = $scope.trees;
        scope.isExpand = $scope.isExpand;

        var compileStr = $compile(templateStr)(scope);
        var templateElement = angular.element(compileStr);

        tbody.html('').append(templateElement);
      });

      function getNewScope() {
        var scope = $scope.$new(true);
        for(var key in $scope.$parent) {
          if(key[0] !== '$') {// 不是 angular 自带属性
            scope[key] = $scope.$parent[key];
          }
        }

        return scope;
      }

      function getTreeTemplate(parentId, children) {
        var length = children.length;
        var branch;
        var branchId;
        var result = '';
        for(var i = 0; i < length; i++) {
          branch = children[i];
          branchId = saveBranch(parentId, branch);
          result += template(branchId) + getTreeTemplate(branchId, getArray(branch.children));
        }

        return result;
      }

      function saveBranch(parentId, branch) {
        var id = generateId();
        $scope.trees[id] = {
          id: id,
          parentId: parentId,
          isExpand: $scope.initExpand,
          data: branch
        };

        return id;
      }

      function template(branchId) {
        var branch = $scope.trees[branchId];
        var parentId = branch.parentId;

        var ttTemplateStr = getJqliteHtml(ttTemplateElement);
        ttTemplateStr = ttTemplateStr.replace(/\*\*/g, getScopeStr(branchId) + '.data');

        var ttTemplateElementWithScope = angular.element(ttTemplateStr);
        var isShow = getShouldExpandStr(branch);
        ttTemplateElementWithScope.attr('ng-show', isShow.str || 'true');

        var tdExpandElement = findTdExpand(ttTemplateElementWithScope.find('td'));
        var tdExpandJQElement = angular.element(tdExpandElement);
        tdExpandJQElement.addClass('tt-expand-td')
          .html(getJqliteHtml(getExpandTemplate(tdExpandJQElement, branch, isShow.level)));

        return getJqliteHtml(ttTemplateElementWithScope);
      }

      function getShouldExpandStr(branch) {
        var parentId = branch.parentId;
        var result = [];
        var level = 0;
        while(parentId) {
          result.push(getScopeStr(parentId) + '.isExpand');
          parentId = $scope.trees[parentId].parentId;
          level++;
        }

        return {
          str: result.join(' && '),
          level: level
        };
      }

      function getScopeStr(branchId) {
        return 'trees[' + branchId + ']';
      }

      function getExpandFunStr(branchId) {
        return 'isExpand(' + branchId + ')';
      }

      function getExpandTemplate(tdElement, branchData, level) {
        var branchId = branchData.id;
        var scopeStr = getScopeStr(branchId);
        var isShow = scopeStr + '.data.children.length > 0';
        var isExpand = scopeStr + '.isExpand && ' + isShow;
        var icon = isExpand + ' ? \'keyboard_arrow_down\' : \'keyboard_arrow_right\'';
        var expandIcon = angular.element('<ng-md-icon size="24"></ng-md-icon>')
        expandIcon.attr('icon', '{{' + icon + '}}')
          .attr('style', 'margin-left: ' + (level * EXPAND_INTEND) + 'px')
          .attr('ng-style', '{ visibility: ' + isShow + ' ? \'\' : \'collapse\'}')
          .attr('ng-click', getExpandFunStr(branchId))
          .addClass('expand-icon');

        return angular.element('<div></div>')
          .append(expandIcon)
          .append(tdElement.contents())
          .attr('layout', 'row')
          .attr('layout-align', 'start center');
      }
    }
  }
})();
