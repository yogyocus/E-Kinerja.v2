(function() {
'use strict';
 
angular.
	module('eKinerja')
	.controller('PengumpulanDataBebanKerjaController', PengumpulanDataBebanKerjaController);

    function PengumpulanDataBebanKerjaController(PengumpulanDataBebanKerjaService, $uibModal,$state, 
      $document, $scope, EkinerjaService, API) {
      var vm = this;
      vm.loading = true;
      vm.loadUrtug = true;
      vm.user = API + 'get-logo-user';
      console.log(JSON.stringify($.parseJSON(sessionStorage.getItem('credential'))));

      // EkinerjaService.checkCredential();
      // EkinerjaService.checkRole($.parseJSON(sessionStorage.getItem('credential')).id);

      vm.list_jabatan = [];
      vm.list_available_urtug = [];
      vm.list_used_urtug = [];
      vm.unit = $.parseJSON(sessionStorage.getItem('credential')).unit;
      vm.unit = vm.unit.toUpperCase();
      // $scope.jabatan = '';
      // $scope.searchName = '';
      // vm.jabatan;

      getAllJabatanByUnitKerja();
      getAllPegawaiByUnitKerja();
      // getUrtugByJabatan();

      $scope.$watch('jabatan', function(){
      	if($scope.jabatan.length == 12 || $scope.jabatan.length == 11){
      		vm.loadUrtug = true;
      		vm.loadUrJab = true;
      		findJabatan();
      		getPejabatPenilai();
      		getUrtugByJabatan();
      	}
      });

      $scope.$watch('choosen_urtug', function(){
      	// if($scope.choosen_urtug.length == 7){
      		// debugger/
      		if($scope.choosen_urtug != '')
      			getUrtugKegiatanByJabatan();
      	// }
      });

  //     $scope.$watch('searchNameUrtug', function(){
  //     	if($scope.searchNameUrtug != ''){
		// 	// $scope.currentPage = 0;
		// 	vm.dataLook = EkinerjaService.searchByUrtug($scope.searchNameUrtug, data);
		// }
  //     });

      $scope.$watch('searchNameJenis', function(){
      	if($scope.searchNameJenis != ''){
			// $scope.currentPage = 0;
			vm.dataLook = EkinerjaService.searchByName($scope.searchName, data);
		}
      });

      vm.tambahPj = function(){
      	var tugas = PengumpulanDataBebanKerjaService.GetUrtugStatus(vm.list_jenis_urtug, $scope.choosen_urtug);
      	$state.go('sk', {
      		"kdUrtug": $scope.choosen_urtug,
      		"kdJenis": tugas.kdJenisUrtug,
      		"kdJabatan": $scope.jabatan,
      		"tahun": tugas.tahunUrtug
      	});
      }

      function getUrtugKegiatanByJabatan(){
      	vm.loadUrtug = false;
      	var tugas = PengumpulanDataBebanKerjaService.GetUrtugStatus(vm.list_jenis_urtug, $scope.choosen_urtug);
  		var data = {
  			"kdUrtug": $scope.choosen_urtug,
  			"kdJabatan": $scope.jabatan,
  			"kdJenisUrtug": tugas.kdJenisUrtug,
  			"tahunUrtug": tugas.tahunUrtug,
  			"kdUnitKerja": $.parseJSON(sessionStorage.getItem('credential')).kdUnitKerja
  		};
  		PengumpulanDataBebanKerjaService.GetUrtugKegiatanByJabatan(data).then(
  			function(response){
  				vm.dataLookKegiatan = response;
  				vm.loadUrtug = false;
  				pagingKegiatan();
  			}, function(errResponse){
          if(errResponse.status == -1)
              EkinerjaService.showToastrError('Gagal Terhubung Ke Server');
            
  			})
      }

      function getAllPegawaiByUnitKerja(){
      	PengumpulanDataBebanKerjaService.GetAllPegawaiByUnitKerja($.parseJSON(sessionStorage.getItem('credential')).kdUnitKerja).then(
      		function(response){
      			vm.list_pegawai = response;
      		}, function(errResponse){
            if(errResponse.status == -1)
              EkinerjaService.showToastrError('Gagal Terhubung Ke Server');
            
      		})
      }

      function getAllJabatanByUnitKerja(){
      	console.log(sessionStorage.getItem('credential'));
      	vm.loading = false;
      	PengumpulanDataBebanKerjaService.GetAllJabatanByUnitKerja($.parseJSON(sessionStorage.getItem('credential')).kdUnitKerja).then(
      		function(response){
      			for(var i = 0; i < response.length; i++){
      				var eselon = response[i].eselon.split('.')[0].toLowerCase();
      				switch(eselon){
      					case 'i' : case 'ii' : case 'iii' : response[i].isEselon4 = false; break;
      					default : response[i].isEselon4 = true; break;
      				}
      			}
      			vm.list_jabatan = response;
      			vm.loading = false;
      			vm.loadUrtug = false;
      		}, function(errResponse){
            if(errResponse.status == -1)
              EkinerjaService.showToastrError('Gagal Terhubung Ke Server');
      			vm.loading = false;
      		}
      	)
      }

      function findJabatan(){
      	vm.jabatan = 
      		EkinerjaService.findJabatanByKdJabatan($scope.jabatan, vm.list_jabatan);
      		// debugger
      }

      function getPejabatPenilai(){
      	PengumpulanDataBebanKerjaService.GetPejabatPenilai($scope.jabatan).then(
      		function(response){
      			vm.penilai = response;
      		}, function(errResponse){
      			if(errResponse.status == -1)
              EkinerjaService.showToastrError('Gagal Terhubung Ke Server');
            vm.penilai = "";
      		})
      }

      function parseMoney(){
      	for(var i = 0; i < vm.dataLook.length;i++)
      		vm.dataLook[i].biaya = EkinerjaService.FormatRupiah(vm.dataLook[i].biaya);
      }

      function collectUsedUrtug(){
      	for(var i = 0; i<vm.list_used_urtug.length;i++){
          var data = vm.list_used_urtug[i].uraianTugas;
          data.volume = vm.list_used_urtug[i].kuantitas;
          data.satuanVolume = vm.list_used_urtug[i].satuanKuantitas;
		  	  vm.urtug_used.push(data);
        }
        debugger
      }

      function getUrtugByJabatan(){
      	vm.loadUrtug = false;
        vm.loading = true;
      	PengumpulanDataBebanKerjaService.GetUrtugByJabatan($scope.jabatan).then(
      		function(response){debugger
      			if(response.jabatanUraianTugasList == undefined)
      				vm.list_used_urtug = [];
      			else vm.list_used_urtug = response.jabatanUraianTugasList;
      			// vm.list_available_urtug = response.notJabatanUraianTugasList;
      			vm.dataLook = vm.list_used_urtug;
      			vm.urtug_used = [];
      			parseMoney();
      			collectUsedUrtug();
      			getJenisUrtugJabatan();
            getUnitUrtug();
      			vm.loadUrtug = false;
      			vm.loadUrJab = false;
            vm.loading = false;
      			paging();
      			// console.log(JSON.stringify(PengumpulanDataBebanKerjaService.SetDataUrtug(vm.list_used_urtug, vm.list_available_urtug)));
      		}, function(errResponse){
      			vm.loadUrtug = false;
            vm.loadUrJab = false;
            vm.loading = false;
            if(errResponse.status == -1)
              EkinerjaService.showToastrError('Gagal Terhubung Ke Server');
      		}
      	)
      }

      function getUnitUrtug(){
        PengumpulanDataBebanKerjaService.GetUnitUrtug().then(
          function(response){
            vm.unitUrtug = response;
          }, function(errResponse){
            if(errResponse.status == -1)
              EkinerjaService.showToastrError('Gagal Terhubung Ke Server');
          })
      }


      function getAllDpa(){
      	vm.urtugDpa = [];
      	for(var i = 0; i < vm.list_jenis_urtug.length; i++)
      		if(vm.list_jenis_urtug[i].jenisUrtug == 'DPA'){
      			vm.list_jenis_urtug[i].jenis = true;
      			vm.urtugDpa.push(vm.list_jenis_urtug[i]);
      		}
      }

      function getJenisUrtugJabatan(){
      	PengumpulanDataBebanKerjaService.GetJenisUrtugJabatan($scope.jabatan).then(
      		function(response){
      			for(var i = 0; i < response.length; i++){
      				if(response[i].kdJenisUrtug != 'KJU001') break;
      				getUrtugKegiatanByJabatan(response[i]);
      			}debugger
      			vm.dataLookJenis = response;
      			vm.list_jenis_urtug = response;
      			getAllDpa();
      			// debugger
      			pagingJenis();
      		}, function(errResponse){
            if(errResponse.status == -1)
              EkinerjaService.showToastrError('Gagal Terhubung Ke Server');
      		})
      }

      function getUrtugKegiatanByJabatan(urtug){
          var data = {
            "kdUrtug": urtug.kdUrtug,
            "kdJabatan": $scope.jabatan,
            "kdJenisUrtug": urtug.kdJenisUrtug,
            "tahunUrtug": urtug.tahunUrtug,
            "kdUnitKerja": $.parseJSON(sessionStorage.getItem('credential')).kdUnitKerja
          };
          // if(isEselon4)
            PengumpulanDataBebanKerjaService.GetUrtugKegiatanByJabatan(data).then(
              function(response){
                urtug.adaDpa = response.length;
              }, function(errResponse){
                if(errResponse.status == -1)
                  EkinerjaService.showToastrError('Gagal Terhubung Ke Server');
              })
          // else 
          //   PengumpulanDataBebanKerjaService.GetUrtugProgramByJabatan(data).then(
          //     function(response){
          //       vm.kegiatan = response;debugger
          //       vm.loadUrtug = false;
          //     }, function(errResponse){

          //     })
        }

      vm.deleteUrtug = function(kdUrtug){
      	PengumpulanDataBebanKerjaService.DeleteUrtugJabatan(vm.jabatan.kdJabatan, kdUrtug)
      		.then(function(response){
      			EkinerjaService.showToastrSuccess('Urtug Berhasil Dihapus');
      			getUrtugByJabatan();
      		},function(errResponse){
            if(errResponse.status == -1)
              EkinerjaService.showToastrError('Gagal Terhubung Ke Server');
      			else EkinerjaService.showToastrError('Gagal Menghapus Urtug');
      		})
      };

      vm.deleteUrtugJenis = function(data){
      	console.log(data);
      	PengumpulanDataBebanKerjaService.DeleteJenisUrtug(data)
      		.then(function(response){
      			EkinerjaService.showToastrSuccess('Urtug Berhasil Dihapus');
      			getUrtugByJabatan();
      		},function(errResponse){debugger
      			if(errResponse.status == -1)
              EkinerjaService.showToastrError('Gagal Terhubung Ke Server');
            else EkinerjaService.showToastrError(errResponse.data.message);
      		})
      };

      vm.open = function (items, parentSelector) {
	      // console.log(items);
		  	// var urtug_used = [];
	      // if(items == undefined){
	      var item = {
	      	"kdJabatan": $scope.jabatan,
	      	"createdBy": $.parseJSON(sessionStorage.getItem('credential')).nipPegawai,
	      	"kuantitas": 0,
	      	"satuanKuantitas": ' ',
	      	"kualitas": 0,
	      	"waktu": 0,
	      	"biaya": 0
	      };
	      var parentElem = parentSelector ? 
	        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
	        // console.log(urtug_used);
	      var modalInstance = $uibModal.open({
	        animation: true,
	        ariaLabelledBy: 'modal-title',
	        ariaDescribedBy: 'modal-body',
	        templateUrl: 'app/uraianJabatan/dataUrtug/dataUrtug.html',
	        controller: 'DataUrtugController',
	        controllerAs: 'dataurtug',
	        // windowClass: 'app-modal-window',
	        size: 'lg',
	        appendTo: parentElem,
	        resolve: {
	          items: function () {
	            return item;
	          },
	          instansi_urtug: function(){
	          	return vm.unitUrtug;
	          },
	          jabatan: function(){
	          	return vm.jabatan.jabatan;
	          }
	        }
	      });

	      modalInstance.result.then(function () {
	      	// showToastrSuccess('ditambahkan');
	      	getUrtugByJabatan();
	        // vm.selected = selectedItem;
	      }, function () {
	      	// showToastrFailed('menambahkan data');
	        // $log.info('Modal dismissed at: ' + new Date());
	      });
	    };

	    vm.kegiatan = function (urtug, parentSelector) {
	      // var tugas = PengumpulanDataBebanKerjaService.GetUrtugStatus(vm.list_jenis_urtug, $scope.choosen_urtug);
	      // var item = {
	      // 	"kdJabatan": $scope.jabatan,
	      // 	"kdUrtug": tugas.kdUrtug,
	      // 	"kdJenisUrtug": tugas.kdJenisUrtug,
	      // 	"tahunUrtug": tugas.tahunUrtug
	      // };
	      // console.log(item);
	      var parentElem = parentSelector ? 
	        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
	      var modalInstance = $uibModal.open({
	        animation: true,
	        ariaLabelledBy: 'modal-title',
	        ariaDescribedBy: 'modal-body',
	        templateUrl: 'app/uraianJabatan/kegiatan/kegiatan.html',
	        controller: 'KegiatanListController',
	        controllerAs: 'kegiatanlist',
	        // windowClass: 'app-modal-window',
	        size: 'lg',
	        appendTo: parentElem,
	        resolve: {
	          urtug: function () {
	            return urtug;
	          }, 
	          jabatan: function(){
	          	return $scope.jabatan;
	          }, 
	          pegawai: function(){
	          	return vm.list_pegawai;
	          },
	          isEselon4: function(){
	          	return vm.jabatan.isEselon4;
	          }
	        }
	      });

	      modalInstance.result.then(function () {
	        getUrtugByJabatan();
	      }, function () {
	      	getUrtugByJabatan();
	      });
	    };

	    vm.status = function (tahun, parentSelector) {
	      // console.log(items);
        debugger
	      var item = {
	      	"kdJabatan": vm.jabatan.kdJabatan,
	      	"tahunUrtug": tahun,
	      	"isEselon4": vm.jabatan.isEselon4
	      	// "kdUrtug": items.kdUrtug,
	      	// "kdJenisUrtug": items.kdJenisUrtug
	      };
	      var parentElem = parentSelector ? 
	        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
	      var modalInstance = $uibModal.open({
	        animation: true,
	        ariaLabelledBy: 'modal-title',
	        ariaDescribedBy: 'modal-body',
	        templateUrl: 'app/uraianJabatan/tambahStatus/tambahStatus.html',
	        controller: 'TambahStatusController',
	        controllerAs: 'status',
	        // windowClass: 'app-modal-window',
	        size: 'lg',
	        appendTo: parentElem,
	        resolve: {
	          items: function () {
	            return item;
	          },
	          used_urtug: function(){
	          	return vm.urtug_used;
	          }
	        }
	      });

	      modalInstance.result.then(function () {
      		getJenisUrtugJabatan();
	        // vm.selected = selectedItem;
	      }, function () {
	      	// showToastrFailed('menambahkan data');
	        // $log.info('Modal dismissed at: ' + new Date());
	      });
	    };

	    vm.changePenilai = function (parentSelector) {
	      // console.log(items);
	      var item = {
	      	"kdJabatanDinilai": vm.jabatan.kdJabatan
	      	// "kdUrtug": items.kdUrtug,
	      	// "kdJenisUrtug": items.kdJenisUrtug
	      };
	      var parentElem = parentSelector ? 
	        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
	      var modalInstance = $uibModal.open({
	        animation: true,
	        ariaLabelledBy: 'modal-title',
	        ariaDescribedBy: 'modal-body',
	        templateUrl: 'app/uraianJabatan/pilihPenilai/pilihPenilai.html',
	        controller: 'PilihPenilaiController',
	        controllerAs: 'penilai',
	        size: 'lg',
	        appendTo: parentElem,
	        resolve: {
	          items: function () {
	            return item;
	          },
	          pegawai: function(){
	          	return vm.list_pegawai;
	          }
	        }
	      });

	      modalInstance.result.then(function () {
      		getJenisUrtugJabatan();
      		getPejabatPenilai();
	        // vm.selected = selectedItem;
	      }, function () {
	      	// showToastrFailed('menambahkan data');
	        // $log.info('Modal dismissed at: ' + new Date());
	      });
	    };

      vm.openDetailUrtug = function (urtug, parentSelector) {
      	console.log(urtug);
          var parentElem = parentSelector ?
              angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
          var modalInstance = $uibModal.open({
              animation: true,
              ariaLabelledBy: 'modal-title',
              ariaDescribedBy: 'modal-body',
              templateUrl: 'app/uraianJabatan/detailUrtug/detailUrtug.html',
              controller: 'DetailUrtugController',
              controllerAs: 'detailUrtug',
              size: 'lg',
              appendTo: parentElem,
              resolve: {
              	urtug: function(){
              		return urtug;
              	}
              }
              // windowClass: 'app-modal-window',
              // size: 'lg',
          });

          modalInstance.result.then(function () {
          }, function () {

          });
      };

	    vm.addUrtugJabatan = function (parentSelector) {
	      var parentElem = parentSelector ? 
	        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
	      var modalInstance = $uibModal.open({
	        animation: true,
	        ariaLabelledBy: 'modal-title',
	        ariaDescribedBy: 'modal-body',
	        templateUrl: 'app/uraianJabatan/tambahUrtugJabatan/tambahUrtugJabatan.html',
	        controller: 'TambahUrtugJabatanController',
	        controllerAs: 'addurjab',
	        appendTo: parentElem,
	        resolve: {
	          kdJabatan: function () {
	            return $scope.jabatan;
	          }
	        }
	      });

	      modalInstance.result.then(function () {
          getUrtugByJabatan();
	      }, function () {
	      });
	    };

	    $scope.$watch('searchNameUrtug', function(){
			if($scope.searchNameUrtug.length != 0)
				vm.dataLook = EkinerjaService.searchByDeskripsiUrtug($scope.searchNameUrtug, vm.list_used_urtug);
			else vm.dataLook = vm.list_used_urtug;
			// debugger
			paging();
		})

		$scope.$watch('searchNameJenis', function(){
			if($scope.searchNameJenis.length != 0)
				vm.dataLookJenis = EkinerjaService.searchByUrtug($scope.searchNameJenis, vm.list_jenis_urtug);
			else vm.dataLookJenis = vm.list_jenis_urtug;
			// debugger
			pagingJenis();
		})

	    function paging(){ 
	          $scope.filteredData = [];
	          $scope.currentPage = 0;
	          $scope.numPerPage = 5;
	          $scope.maxSize = Math.ceil(vm.dataLook.length/$scope.numPerPage);
	          function page(){
	            $scope.page = [];
	            for(var i = 0; i < vm.dataLook.length/$scope.numPerPage; i++){
	                $scope.page.push(i+1);
	            }
	          }
	          page();
	          $scope.pad = function(i){
	            $scope.currentPage += i;
	          }

	          $scope.max = function(){
	            if($scope.currentPage >= $scope.maxSize - 1)
	                return true;
	            else return false;
	          }

	          $scope.$watch("currentPage + numPerPage", function() {
	            var begin = (($scope.currentPage) * $scope.numPerPage)
	            , end = begin + $scope.numPerPage;

	            $scope.filteredData = vm.dataLook.slice(begin, end);
	          });
	        }

	    function pagingJenis(){ 
	          $scope.filteredDataJenis = [];
	          $scope.currentPageJenis = 0;
	          $scope.numPerPage = 5;
	          $scope.maxSizeJenis = Math.ceil(vm.dataLookJenis.length/$scope.numPerPage);
	          function page(){
	            $scope.pageJenis = [];
	            for(var i = 0; i < vm.dataLookJenis.length/$scope.numPerPage; i++){
	                $scope.pageJenis.push(i+1);
	            }
	          }
	          page();
	          $scope.padJenis = function(i){
	            $scope.currentPageJenis += i;
	          }

	          $scope.maxJenis = function(){
	            if($scope.currentPageJenis >= $scope.maxSizeJenis - 1)
	                return true;
	            else return false;
	          }

	          $scope.$watch("currentPageJenis + numPerPage", function() {
	            var begin = (($scope.currentPageJenis) * $scope.numPerPage)
	            , end = begin + $scope.numPerPage;

	            $scope.filteredDataJenis = vm.dataLookJenis.slice(begin, end);
	          });
	        }

	    function pagingKegiatan(){ 
	          $scope.filteredDataKegiatan = [];
	          $scope.currentPageKegiatan = 0;
	          $scope.numPerPage = 15;
	          $scope.maxSizeKegiatan = Math.ceil(vm.dataLookKegiatan.length/$scope.numPerPage);
	          function page(){
	            $scope.pageKegiatan = [];
	            for(var i = 0; i < vm.dataLookKegiatan.length/$scope.numPerPage; i++){
	                $scope.pageKegiatan.push(i+1);
	            }
	          }
	          page();
	          $scope.padKegiatan = function(i){
	            $scope.currentPageJenis += i;
	          }

	          $scope.maxKegiatan = function(){
	            if($scope.currentPageKegiatan >= $scope.maxSizeKegiatan - 1)
	                return true;
	            else return false;
	          }

	          $scope.$watch("currentPageKegiatan + numPerPage", function() {
	            var begin = (($scope.currentPageJenis) * $scope.numPerPage)
	            , end = begin + $scope.numPerPage;

	            $scope.filteredDataKegiatan = vm.dataLookKegiatan.slice(begin, end);
	          });
	        }
   } 
})();