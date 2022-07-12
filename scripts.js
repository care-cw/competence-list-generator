/**
 * CONFIGURE THIS PATH
 */
const jsonFile = 'mpa.data.json';

function copyText(inputSelector) {
  /* Get the text field */
  var copyText = document.getElementById(inputSelector);

  /* Copy the text inside the text field */
  navigator.clipboard.writeText(copyText.innerText);

  alert('Kopiert!');
}

$(document).ready(function () {
  /**
   * Get JSON Data
   */
  let jsonData;
  let codeName;

  $.getJSON(jsonFile, function (data) {
    jsonData = data;
    codeName = firstLetterUppercase(data.name);
  });

  /**
   * Helper functions
   */

  function firstLetterUppercase(string) {
    const name = string.charAt(0).toUpperCase() + string.slice(1);
    return name;
  }

  function getHTMLHeaderFourRatings(data) {
    let code = '';
    code += `
    <tr class="competence-head">
        <td class="competence-sector-title">${data.title}</td>
        `;

    $.each(data.ratingCaptions, function (index, caption) {
      code += `<td class="competence-thead"><span>${caption}</span></td>
      `;
    });

    code += `</tr>
    `;

    return code;
  }

  function generateAccordionRow(title, name, code, path) {
    $('generator').append(
      `<h3>${title} <br /><small style='padding-left: 16px;'>${path}</small> <span style="inline-block; float: right;"><button onClick="copyText('${name}')">Kopieren</button></span></h3><div><pre><code id="${name}"></code></pre></div>`
    );
    $('#' + name).text(code);
  }

  function getRatingValue(index) {
    switch (index) {
      case 0:
        return 'verygood';
      case 1:
        return 'good';
      case 2:
        return 'less';
      case 3:
        return 'none';
    }
  }

  function getHTMLFourRatingTableOptions(ratingTable) {
    let code = '';

    $.each(ratingTable.options, function (index, option) {
      code += `<tr>
      `;

      if (option.type === 'heading') {
        code += `<td colspan="${ratingTable.ratingCaptions.length + 1}"><strong>`;
      } else {
        code += `<td>`;
      }

      code += option.title;

      if (option.type === 'heading') {
        code += `</strong>`;
      }

      code += `</td>
      `;

      if (!option.type) {
        $.each(ratingTable.ratingCaptions, function (index, caption) {
          code += `<td class="competence-table-input">
            <input ng-model="${option.name}" required type="radio" value="${getRatingValue(index)}" ng-checked="${option.name} == '${getRatingValue(index)}'">
          </td>
        `;
        });
      }

      if (option.type === 'further') {
        code += `<td colspan="${ratingTable.ratingCaptions.length}">
          <textarea ng-model="${option.name}" class="form-control no-print" rows="1" name=""></textarea>
          <p class="print">{{${option.name}}}</p>
        </td>
        `;
      }

      code += `</tr>
      `;
    });

    return code;
  }

  /**
   * Code generation for the files, C# and SQL
   */
  function generateHTMLForHTMLFile() {
    let code = '';

    code += `<script>
$(function () {
    var header_height = 0;
    $('.competence-thead span').each(function () {
        if ($(this).outerWidth() > header_height) header_height = $(this).outerWidth();
    });

    $('.competence-thead').height(header_height);
});
</script>

<div class="page page-competence-${jsonData.name}" id="print-page-competence-${jsonData.name}">
<div class="row">
    <div class="col-xs-12">
        <section class="panel panel-default">
            <div class="panel-heading"><strong><span class="glyphicon glyphicon-th"></span> Kompetenzliste: ${jsonData.title}</strong></div>
            <div class="panel-body">
                <div class="row no-print">
                    <div class="col-md-6"><a href="#/account/competences"><span class="fa fa-caret-left"></span> Zurück zur Übersicht</a></div>
                    <div class="col-md-6 text-right"><a ng-click="print()"><span class="fa fa-print"></span> Drucken</a></div>
                </div>
                <br>
                <div class="form-group">
                    <form class="form-horizontal form-validation" novalidate name="competences" data-ng-submit="submit()">
                        <h1 class="print">{{workforceName}}</h1>
`;

    $.each(jsonData.data, function (index, data) {
      if (!!data.title) {
        code += `<h2>${data.title}</h2>
        `;
      }

      code += `<table class="table table-bordered table-hover">
      `;

      switch (data.ratingTable.type) {
        case 'fourRatings':
          code += getHTMLHeaderFourRatings(data.ratingTable);
          code += getHTMLFourRatingTableOptions(data.ratingTable);
          code += `
            <tr>
              <td>Andere</td>
              <td colspan="8">
                <textarea ng-model="${data.ratingTable.others}" class="form-control no-print" rows="2" name=""></textarea>
                <p class="print">{{${data.ratingTable.others}}}</p>
              </td>
            </tr>
            `;
          break;
        case 'yesNo':
          code += getHeaderForYesNo(data.ratingTable);
          break;
      }

      code += `</table>
      `;
    });

    code += `
        <div class="form-group no-print">
          <div class="col-sm-12">
              <input type="submit" value="Speichern" class="btn btn-primary" btn-loading data-loading-text="Lädt..." ng-disabled="loading" />
          </div>
      </div>
    </form>
  </div>
  <br />
  <div class="row no-print">
  <div class="col-md-6"><a href="#/account/competences" class="no-print"><span class="fa fa-caret-left"></span> Zurück zur Übersicht</a></div>
  <div class="col-md-6 text-right"><a ng-click="print()"><span class="fa fa-print"></span> Drucken</a></div>
</div>
</div>
</section>
</div>
</div>
</div>
      `;

    generateAccordionRow('HTML-File', 'htmlFile', code, `/App/client/views/app/components/account/accountCompetence${firstLetterUppercase(jsonData.name)}.html`);
  }

  function generateHTMLForModal() {
    let code = '';

    code += `<div class="modal-header">
    <div class="row">
        <div class="col-xs-9">
            <h3>${jsonData.title}</h3>
            <p><strong>Kandidat</strong>: {{workforceName}}</p>
        </div>
        <div class="col-xs-3 text-right"><a ng-click="print()"><span class="fa fa-print"></span> Drucken</a></div>
    </div>
</div>
<div class="modal-body">
    <div class="row" ng-show="isFilled === false">
        <p class="col-xs-12">
            Der Kandidat hat diese Kompetenzliste leider noch nicht ausgefüllt.
        </p>
    </div>
    <div class="row" ng-show="isFilled === true" id="print-modal">
        <div class="col-xs-11 print">
            <h3>${jsonData.title}</h3>
            <p><strong>Kandidat</strong>: {{workforceName}}</p>
        </div>`;

    $.each(jsonData.data, function (index, data) {
      if (!!data.title) {
        code += `
        <div class="col-xs-11"><h3>${data.title}</h3></div>
            `;
      }

      $.each(data.ratingTable.options, function (indexOption, option) {
        code += `<label class="col-xs-4">${option.title}</label>`;
        if (option.inDB !== false) {
          code += `
            <div class="col-xs-8">
                <span>{{${option.name}}}</span>
            </div>
            <hr class="col-xs-11" />
            `;
        }
      });

      if (!!data.ratingTable.others) {
        code += `<label class="col-xs-4">Andere</label>
            <div class="col-xs-8">
                <span>{{${data.ratingTable.others}}}</span>
            </div>
            <hr class="col-xs-11" />
            `;
      }
    });
    code += `
    </div>
</div>
<div class="modal-footer">
    <button class="btn btn-warning" ng-click="cancel()"><span data-i18n="general.close"></span></button>
</div>
`;

    generateAccordionRow('Modal-File', 'modalFile', code, `/App/client/views/app/components/account/accountCompetence${firstLetterUppercase(jsonData.name)}Modal.html`);
  }
  function generateHTMLForShow() {
    // seemingly not needed ATM
  }

  function generateJSForHTMLFile() {
    let code = '';

    // block for retrieval
    code += `
    'use strict';
    angular.module('app.account').controller('AccountCompetence${codeName}Ctrl', ['$scope', '$location', 'localize', 'AccountFactory', 'logger', function ($scope, $location, localize, AccountFactory, logger) {

    document.title = 'Kompetenzliste ${jsonData.title} - ' + AccountFactory.authentication.name + ' - Careanesth';

    $scope.loading = false;
    var isUpdate = false;

    $scope.workforceName = AccountFactory.authentication.name;

    AccountFactory.getCompetence${codeName}(AccountFactory.authentication.workforceId).then(function (result) {
      if (result !== null && result !== undefined) {

          isUpdate = true;
    `;
    $.each(jsonData.data, function (index, data) {
      $.each(data.ratingTable.options, function (indexOption, option) {
        if (option.inDB !== false) {
          code += `$scope.${option.name} = result.${option.name};
        `;
        }
      });
      if (!!data.ratingTable.others) {
        code += `$scope.${data.ratingTable.others} = result.${data.ratingTable.others};`;
      }
    });

    code += `
  }
});

$scope.submit = function () {
    $scope.loading = true;

    if ($scope.competences.$invalid) {
        $scope.loading = false;
        $scope.formIsInvalid = true;

        $('.ui-radio span').removeClass("not_valid");
        $('.ng-invalid-required').siblings().addClass("not_valid");
        logger.logError(localize.getLocalizedString('general.fill-in-all-fields'));

        var element = angular.element('.not_valid').offset().top;
        element = element > 0 ? element : element * -1;
        var pageHeight = angular.element('.page').height();
        var headElement = angular.element('.panel-heading').offset().top;
        headElement = headElement > 0 ? headElement : headElement * -1;
        var calc = headElement - element - 10;

        angular.element('#content').animate({ scrollTop: calc }, "slow");

    } else {
    var competence = {
    `;
    $.each(jsonData.data, function (index, data) {
      $.each(data.ratingTable.options, function (indexOption, option) {
        if (option.inDB !== false) {
          code += `'${option.name}': $scope.${option.name},
        `;
        }
      });
      if (!!data.ratingTable.others) {
        code += `'${data.ratingTable.others}': $scope.${data.ratingTable.others},
        `;
      }
    });

    code += `
  };

    if (isUpdate === true) {
        AccountFactory.updateCompetence${codeName}(competence).then(function (result) {
            $scope.loading = false;
        });
    } else {
        AccountFactory.createCompetence${codeName}(competence).then(function (result) {
            if (result.success !== false) {
                isUpdate = true;
            }
            $scope.loading = false;
        });
    }
}
};

$scope.print = function () {
  var printContents = document.getElementById('print-page-competence-${jsonData.name}').innerHTML;
  var popupWin = window.open('', '_blank', 'width=500,height=500');
  popupWin.document.open();
  popupWin.document.write('<html><head><link rel="stylesheet" href="/App/dist/styles/assets/main.css"><link rel="stylesheet" href="/App/dist/styles/app/endu.css"></head><body onload="window.print()">' + printContents + '</body></html>');
  popupWin.document.close();
};

var optionsToString = function (options) {
  result = '';
  var length = options.length;

  for (var i = 0; i < length; i++) {
      var option = options[i];
      if (option.value === true) {
          result += option.name + ',';
      }
  }

  // remove last comma
  result = result.replace(/,\s*$/, "");

  return result;
};

var stringToOptions = function (string, options) {
  result = angular.copy(options);
  var length = result.length;

  for (var i = 0; i < length; i++) {
      var option = result[i];
      if (string.indexOf(option.name) !== -1) {
          option.value = true;
      }
  }

  return result;
};
}]);

`;

    generateAccordionRow('JS HTML-File', 'htmlJS', code, `/App/client/views/app/components/account/accountCompetence${firstLetterUppercase(jsonData.name)}.js`);
  }
  function generateJSForModal() {
    let code = '';

    // block for retrieval
    code += `
    'use strict';
angular.module('app.account').controller('AccountCompetence${codeName}Modal', [
    '$scope', '$location', '$modalInstance', 'AccountFactory', 'logger', 'localize', 'dataForModal', function ($scope, $location, $modalInstance, AccountFactory, logger, localize, dataForModal) {

            $scope.isFilled = false;

            AccountFactory.getCompetence${codeName}(dataForModal.workforceId).then(function (result) {
                $scope.workforceName = dataForModal.workforceName;

                if (result !== null && result !== undefined) {
                    $scope.isFilled = true;
    `;
    $.each(jsonData.data, function (index, data) {
      $.each(data.ratingTable.options, function (indexOption, option) {
        if (option.inDB !== false) {
          code += `$scope.${option.name} = `;
          if (!option.type) {
            code += `getReadableOptions(result.${option.name});
            `;
          } else {
            code += `result.${option.name}
            `;
          }
        }
      });

      if (!!data.ratingTable.others) {
        code += `$scope.${data.ratingTable.others} = result.${data.ratingTable.others};
        `;
      }
    });

    code += `
      }
    });

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
  };

  $scope.print = function () {
      var printContents = document.getElementById('print-modal').innerHTML;
      var popupWin = window.open('', '_blank', 'width=500,height=500');
      popupWin.document.open();
      popupWin.document.write('<html><head><link rel="stylesheet" href="/App/dist/styles/assets/main.css"><link rel="stylesheet" href="/App/dist/styles/app/endu.css"></head><body onload="window.print()">' + printContents + '</body></html>');
      popupWin.document.close();
  };

  var getReadableOptions = function (optionsAsString, type) {
      if (optionsAsString === undefined || optionsAsString === null || optionsAsString === '') return '';

      var result = '';

      // get localized strings for each option
      var options = optionsAsString.split(',');
      for (var i = 0; i < options.length; i++) {
          result += localize.getLocalizedString(options[i]) + ', ';
      }

      // remove last comma
      if (result.length > 0) {
          result = result.substring(0, result.length - 2);
      }

      // add prefix to result
      if (type === 'stations') result = '<br><strong>Pflegebereiche</strong>: ' + result;
      if (type === 'forms') result = '<br><strong>Formen</strong>: ' + result;

      return result;
  };
}
]);
    `;

    generateAccordionRow('JS Modal-File', 'modalJS', code, `/App/client/scripts/app/components/account/accountCompetence${firstLetterUppercase(jsonData.name)}Modal.js`);
  }

  function generateJSForShow() {}

  function generateJSForAccountFactory() {
    let code = '';

    code += `
   var _createCompetence${codeName} = function (competence) {
        var deferredObject = $q.defer();

        $http.post(
            '/api/competences/${jsonData.name}/workforce/' + _authentication.workforceId, competence
        ).success(function (result) {
            logger.logSuccess(localize.getLocalizedString('account.competence-save-success'));
            deferredObject.resolve(result);
        }).error(function (result) {
            logger.logError(result.message);
            deferredObject.reject({ success: false });
        });

        return deferredObject.promise;
    };

    var _getCompetence${codeName} = function (workforceId) {
        var deferredObject = $q.defer();

        $http.get(
            '/api/competences/${jsonData.name}/workforce/' + workforceId
        ).success(function (result) {
            deferredObject.resolve(result);
        }).error(function (result) {
            logger.logError(result.message);
            deferredObject.reject({ success: false });
        });

        return deferredObject.promise;
    };

    var _updateCompetence${codeName} = function (competence) {
        var deferredObject = $q.defer();

        $http.put(
            '/api/competences/${jsonData.name}/workforce/' + _authentication.workforceId, competence
        ).success(function (result) {
            logger.logSuccess(localize.getLocalizedString('account.competence-save-success'));
            deferredObject.resolve(result);
        }).error(function (result) {
            logger.logError(result.message);
            deferredObject.reject({ success: false });
        });

        return deferredObject.promise;
    };


    // function calls for the bottom of the document
    createCompetence${codeName}:_createCompetence${codeName},
    getCompetence${codeName}:_getCompetence${codeName},
    updateCompetence${codeName}:_updateCompetence${codeName},
  `;
    generateAccordionRow('JS for AccountFactory', 'jsFactory', code, `/App/client/scripts/app/components/account/accountFactory.js`);
  }

  function generateCSharpObject() {
    let code = '';

    code += `using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;

    namespace BusinessObjects
    {
      public class Competence${firstLetterUppercase(jsonData.name)}
      {
        public int ID { get; set; }
        public int WorkforceID { get; set; }
    `;

    $.each(jsonData.data, function (index, data) {
      $.each(data.ratingTable.options, function (indexOption, option) {
        if (option.inDB !== false) {
          code += `public string ${firstLetterUppercase(option.name)} { get; set; }
          `;
        }
      });

      if (!!data.ratingTable.others) {
        code += `public string ${firstLetterUppercase(data.ratingTable.others)} { get; set; }
          `;
      }
    });

    code += `}
  }`;

    generateAccordionRow('C# Object', 'csObject', code, `BusinessObjects: /Competence${firstLetterUppercase(jsonData.name)}.cs`);
  }
  function generateCSharpController() {
    let code = '';

    code += `

        /**
         *
         * BOX FOR CONTROLLER
         *
         * */

        #region ${jsonData.name}
        [WebAPIAuthorize(Roles = "Candidate")]
        [Route("api/competences/${jsonData.name}/workforce/{workforceID}")]
        [HttpPost]
        public void Insert${codeName}(int workforceID, Competence${codeName} competence${codeName})
        {
            CompetenceService competenceService = new CompetenceService();

            competence${codeName}.WorkforceID = workforceID;
            competenceService.InsertCompetence${codeName}(competence${codeName});
        }

        [WebAPIAuthorize(Roles = "Candidate, Partner, CARE, Administrator")]
        [Route("api/competences/${jsonData.name}/workforce/{workforceID}")]
        [HttpGet]
        public IHttpActionResult GetCompetence${codeName}(int workforceID)
        {
            CompetenceService competenceService = new CompetenceService();
            Competence${codeName} competence${codeName} = competenceService.GetCompetence${codeName}(workforceID);

            return Ok(competence${codeName});
        }

        [WebAPIAuthorize(Roles = "Candidate")]
        [Route("api/competences/${jsonData.name}/workforce/{workforceID}")]
        [HttpPut]
        public void Update${codeName}(int workforceID, Competence${codeName} competence${codeName})
        {
            CompetenceService competenceService = new CompetenceService();

            competence${codeName}.WorkforceID = workforceID;
            competenceService.UpdateCompetence${codeName}(competence${codeName});
        }
        #endregion

        /**
         *
         * BOX FOR SERVICE
         *
         * */

        #region ${codeName}
         public Competence${codeName} InsertCompetence${codeName}(Competence${codeName} competence${codeName})
         {
             return competenceRepository.InsertCompetence${codeName}(competence${codeName});
         }

         public Competence${codeName} GetCompetence${codeName}(int workforceID)
         {
             return competenceRepository.GetCompetence${codeName}(workforceID);
         }

         public void UpdateCompetence${codeName}(Competence${codeName} competence${codeName})
         {
             competenceRepository.UpdateCompetence${codeName}(competence${codeName});
         }

         #endregion

     `;

    generateAccordionRow(
      'C# Controller & Service',
      'csController',
      code,
      'Controller: PresentationLayer -> WebApiController/CompetenceController.cs & Service: BusinessLogicLayer -> CompetenceService.cs'
    );
  }

  function generateCSharpRepository() {
    let code = '';

    code += `
    #region ${codeName}
        public Competence${codeName} InsertCompetence${codeName}(Competence${codeName} competence)
        {
            Competence${codeName} result = null;

            if (IsDataToInsertValidForCompetence${codeName}(competence))
            {
                DbCommand command = PrepareDbCommandToInsertCompetence${codeName}(competence, false);
                dataManager.Open();
                command.Connection = dataManager.Connection;
                command.ExecuteNonQuery();
                command.Dispose();
                dataManager.Close();

                result = GetCompetence${codeName}(competence.WorkforceID);
            }

            return result;
        }

        private bool IsDataToInsertValidForCompetence${codeName}(Competence${codeName} competence)
        {
            if (competence == null) throw new ArgumentNullException(ApplicationConfiguration.TextResources.TextResources.Competence_Error_MustBeSet);
            if (competence.WorkforceID <= 0) throw new ArgumentOutOfRangeException(ApplicationConfiguration.TextResources.TextResources.Competence_Error_WorkforceIDMustBeGreaterThanZero);
            return true;
        }


        private DbCommand PrepareDbCommandToInsertCompetence${codeName}(Competence${codeName} competence, bool isUpdate)
        {
            DbCommand command = DBFactory.GetCommand(DataProviderType.SqlServer);
            command.CommandText = "InsertCompetence${codeName}";
            command.CommandType = CommandType.StoredProcedure;

            if (isUpdate)
            {
                command.CommandText = "UpdateCompetence${codeName}";
            }

            DbParameter paramWorkforceID = command.CreateParameter();
            paramWorkforceID.ParameterName = "@WorkforceID";
            paramWorkforceID.DbType = DbType.Int32;
            paramWorkforceID.Value = competence.WorkforceID;
            command.Parameters.Add(paramWorkforceID);
    `;

    $.each(jsonData.data, function (index, data) {
      $.each(data.ratingTable.options, function (indexOption, option) {
        if (option.inDB !== false) {
          const optionCode = firstLetterUppercase(option.name);
          code += `
        DbParameter param${optionCode} = command.CreateParameter();
        param${optionCode}.ParameterName = "@${optionCode}";
        param${optionCode}.DbType = DbType.String;
        param${optionCode}.Value = competence.${optionCode};
        command.Parameters.Add(param${optionCode});
        `;
        }
      });

      if (!!data.ratingTable.others) {
        const optionCode = firstLetterUppercase(data.ratingTable.others);
        code += `
        DbParameter param${optionCode} = command.CreateParameter();
        param${optionCode}.ParameterName = "@${optionCode}";
        param${optionCode}.DbType = DbType.String;
        param${optionCode}.Value = competence.${optionCode};
        command.Parameters.Add(param${optionCode});
        `;
      }
    });

    code += `
    return command;
    }


    public Competence${codeName} GetCompetence${codeName}(int workforceID)
        {
            Competence${codeName} result = null;
            DataSet ds = null;

            try
            {
                DbCommand command = DBFactory.GetCommand(DataProviderType.SqlServer);
                command.CommandText = "GetCompetence${codeName}ByWorkforceID";
                command.CommandType = CommandType.StoredProcedure;

                DbParameter paramWorkforceID = command.CreateParameter();
                paramWorkforceID.ParameterName = "@WorkforceID";
                paramWorkforceID.DbType = DbType.Int32;
                paramWorkforceID.Value = workforceID;
                command.Parameters.Add(paramWorkforceID);

                dataManager.Open();
                ds = dataManager.GetDataSet(command);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                dataManager.Close();
            }

            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                result = new Competence${codeName}()
                {

                  ID = row.Field<int>("Competence${codeName}ID"),
                  WorkforceID = row.Field<int>("WorkforceID"),
    `;

    $.each(jsonData.data, function (index, data) {
      $.each(data.ratingTable.options, function (indexOption, option) {
        optionCode = firstLetterUppercase(option.name);
        if (option.inDB !== false) {
          code += `
        ${optionCode} = row.Field<string>("${optionCode}"),`;
        }
      });

      if (!!data.ratingTable.others) {
        code += `
        ${firstLetterUppercase(data.ratingTable.others)} = row.Field<string>("${firstLetterUppercase(data.ratingTable.others)}"),`;
      }
    });

    code = code.slice(0, -1);

    code += `};
  }
  return result;
}

public void UpdateCompetence${codeName}(Competence${codeName} competence)
{
  if (IsDataToInsertValidForCompetence${codeName}(competence))
  {
      DbCommand command = PrepareDbCommandToInsertCompetence${codeName}(competence, true);
      dataManager.Open();
      command.Connection = dataManager.Connection;
      command.ExecuteNonQuery();
      command.Dispose();
      dataManager.Close();
  }
}
#endregion
`;

    generateAccordionRow('C# Repository', 'csRepo', code, 'DataAccessLayer->CompetenceRepository.cs');
  }

  function generateSQLTable() {
    let code = '';

    code += `
    SET ANSI_NULLS ON
    GO

    SET QUOTED_IDENTIFIER ON
    GO

    CREATE TABLE [dbo].[Competence${codeName}](
	  [Competence${codeName}ID] [int] IDENTITY(1,1) NOT NULL,
	  [WorkforceID] [int] NOT NULL,
    `;

    $.each(jsonData.data, function (index, data) {
      $.each(data.ratingTable.options, function (indexOption, option) {
        if (option.inDB !== false) {
          const optionCode = firstLetterUppercase(option.name);
          code += `
        [${optionCode}] [nvarchar](50) NULL,`;
        }
      });
      if (!!data.ratingTable.others) {
        code += `
        [${firstLetterUppercase(data.ratingTable.others)}] [nvarchar](500) NULL,`;
      }
    });
    // remove last comma
    code = code.slice(0, -1);

    code += `) ON [PRIMARY]
    GO`;

    generateAccordionRow('SQL Create Table', 'sqlCreate', code, 'Ausführen in SQL-Management Studio');
  }

  function generateSQLStoredProcedures() {
    let code = '';

    code += `
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[GetCompetence${codeName}ByWorkforceID]
	-- Add the parameters for the stored procedure here
	@WorkforceID int

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	SELECT * FROM Competence${codeName} WHERE WorkforceID = @WorkforceID

END
GO
`;

    code += `
CREATE OR ALTER PROCEDURE [dbo].[InsertCompetence${codeName}]
-- Add the parameters for the stored procedure here
@WorkforceID int,

`;

    $.each(jsonData.data, function (index, data) {
      $.each(data.ratingTable.options, function (indexOption, option) {
        if (option.inDB !== false) {
          code += `
        @${firstLetterUppercase(option.name)} nvarchar(50),`;
        }
      });

      if (!!data.ratingTable.others) {
        code += `
        @${firstLetterUppercase(data.ratingTable.others)} nvarchar(500) = NULL,`;
      }
    });

    //remove last comma
    code = code.slice(0, -1);

    code += `
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;

  -- Insert statements for procedure here
INSERT INTO Competence${codeName}
  (
      [WorkforceID],
      `;

    $.each(jsonData.data, function (index, data) {
      $.each(data.ratingTable.options, function (indexOption, option) {
        if (option.inDB !== false) {
          code += `
        [${firstLetterUppercase(option.name)}],`;
        }
      });

      if (!!data.ratingTable.others) {
        code += `
        [${firstLetterUppercase(data.ratingTable.others)}],`;
      }
    });

    //remove last comma
    code = code.slice(0, -1);

    code += `
  )
VALUES
  (
      @WorkforceID,
     `;

    $.each(jsonData.data, function (index, data) {
      $.each(data.ratingTable.options, function (indexOption, option) {
        if (option.inDB !== false) {
          code += `
        @${firstLetterUppercase(option.name)},`;
        }
      });

      if (!!data.ratingTable.others) {
        code += `
        @${firstLetterUppercase(data.ratingTable.others)},`;
      }
    });

    //remove last comma
    code = code.slice(0, -1);

    code += `)
     END
     GO`;

    code += `
     CREATE OR ALTER PROCEDURE [dbo].[UpdateCompetence${codeName}]
     -- Add the parameters for the stored procedure here
     @WorkforceID int,
     `;

    $.each(jsonData.data, function (index, data) {
      $.each(data.ratingTable.options, function (indexOption, option) {
        if (option.inDB !== false) {
          code += `
        @${firstLetterUppercase(option.name)} nvarchar(50),`;
        }
      });

      if (!!data.ratingTable.others) {
        code += `
        @${firstLetterUppercase(data.ratingTable.others)} nvarchar(500) = NULL,`;
      }
    });

    //remove last comma
    code = code.slice(0, -1);

    code += `

   AS
   BEGIN
     -- SET NOCOUNT ON added to prevent extra result sets from
     -- interfering with SELECT statements.
     SET NOCOUNT ON;

       -- Insert statements for procedure here
     UPDATE Competence${codeName}

     SET
       [WorkforceID] = @WorkforceID,
       `;

    $.each(jsonData.data, function (index, data) {
      $.each(data.ratingTable.options, function (indexOption, option) {
        if (option.inDB !== false) {
          code += `
        [${firstLetterUppercase(option.name)}] = @${firstLetterUppercase(option.name)},`;
        }
      });

      if (!!data.ratingTable.others) {
        code += `
        [${firstLetterUppercase(data.ratingTable.others)}] = @${firstLetterUppercase(data.ratingTable.others)},`;
      }
    });

    //remove last comma
    code = code.slice(0, -1);

    code += `

     WHERE
       WorkforceID = @WorkforceID
   END
   GO
   `;

    generateAccordionRow('Stored Procedures', 'sqlSP', code, 'Ausführen in SQL Management Studio');
  }

  function generateHTMLForIndex() {
    let code = `
    <script src="scripts/app/components/account/accountCompetence${codeName}.js"></script>
    <script src="scripts/app/components/account/accountCompetence${codeName}Modal.js"></script>
    <script src="scripts/app/components/account/accountCompetence${codeName}Show.js"></script>
    `;

    generateAccordionRow('HTML for index.html', 'htmlIndex', code, 'PresentationLayer: index.html');
  }

  function generateJSForApp() {
    let code = `
    // ${jsonData.name}
  }).when('/account/competences/${jsonData.name}', {
      templateUrl: '/app/dist/views/app/components/account/accountCompetence${codeName}.html',
      controller: 'AccountCompetence${codeName}Ctrl'
  }).when('/account/competences/${jsonData.name}-show', {
      templateUrl: '/app/dist/views/app/components/account/accountCompetence${codeName}Show.html',
      controller: 'AccountCompetence${codeName}ShowCtrl'
    `;

    generateAccordionRow('JS for app.js', 'jsApp', code, 'PresentationLayer: app.js');
  }

  function generateHTMLForCompetenceList() {
    let code = `
    <tr ng-show="show${codeName} === true">
      <td>
        <a href="#/account/competences/${jsonData.name}" class="action_button user_edit fa fa-pencil" title="Bearbeiten"></a>
        <a href="#/account/competences/${jsonData.name}" class="action_button action_show fa fa-list" title="Anzeigen"></a>
      </td>
      <td>
        <span>${jsonData.title}</span>
      </td>
    </tr>
    `;

    generateAccordionRow('HTML for accountCompetences.html', 'htmlCompetences', code, '/app/client/views/app/components/account/accountCompetences.html');
  }

  function generateJSForCompetenceList() {
    let code = `
    // top of the document
    $scope.show${codeName} = false;

    // middle section
    //if ${jsonData.name}
    if (result[i].id == ${jsonData.sectorId}) {
        $scope.show${codeName} = true;
    }

    // bottom section
    && $scope.show${codeName} === false
    `;

    generateAccordionRow('HTML for accountCompetences.js', 'jsCompetences', code, '/app/client/scripts/app/components/account/accountCompetences.html');
  }

  function generateJSForHeaderCtrl() {
    let code = `
  // on Line 93 in the array  "var candidatePages = []"
  '/account/competences/${jsonData.name}',`;

    generateAccordionRow('JS for headerCtrl.js', 'jsHeader', code, 'Add to /App/client/scripts/app/shared/header/headerCtrl.js');
  }

  function generateJSForRosterHelper() {
    let code = `
    //block for if statements on line ~3230
    var is${codeName} = false;

    //if ${jsonData.name}
    if (userData.sectors[i].id == ${jsonData.sectorId}) {
      toolTipText += '<br /><a data-open-modal="openModal${codeName}">${jsonData.toolTipText}</a>';
      is${codeName} = true;
    }

      // statement for the hyper-if
      && is${codeName} === false

      `;
    generateAccordionRow('JS for RosterHelper', 'jsRosterHelper', code, '/app/client/scripts/app/components/roster/rosterHelper.js');
  }

  /**
   * Eventlistener for the click event
   */
  $('.generate').click(function () {
    generateHTMLForHTMLFile();
    generateHTMLForModal();

    generateJSForHTMLFile();
    generateJSForModal();

    generateJSForAccountFactory();

    generateCSharpObject();
    generateCSharpController();
    generateCSharpRepository();

    generateSQLTable();
    generateSQLStoredProcedures();

    generateHTMLForIndex();
    generateJSForApp();

    generateHTMLForCompetenceList();
    generateJSForCompetenceList();

    generateJSForHeaderCtrl();

    generateJSForRosterHelper();

    // initialize accordion
    $('generator').accordion();

    // remove generate button
    $('.generate').remove();
  });
});
