(function(){
    'use strict';

    angular.module('eKinerja').controller('PenilaianController', PenilaianController);

    function PenilaianController(EkinerjaService,
                                 PenilaianService,
                                 PenugasanService,
                                 TemplateSuratPerintahService,
                                 $scope,
                                 $state,
                                 $uibModal,
                                 $document,
                                 DashboardService,
                                 $window,
                                 API,
                                 TemplateSuratKeputusanService,
                                 TemplateSuratDinasService,
                                 TemplateLaporanService,
                                 TemplateTelaahanStaffService,
                                 TemplateSuratUndanganService,
                                 TemplateSuratPengantarService,
                                 TemplateSuratEdaranService,
                                 TemplatePengumumanService,
                                 TemplateMemorandumService,
                                 TemplateSuratKuasaService,
                                 TemplateSuratKeteranganService,
                                 TemplateNotaDinasService,
                                 TemplateBeritaAcaraService,
                                 TemplateSuratTugasService){
        var vm = this;
        vm.loading = true;
        vm.bulan = (new Date()).getMonth().toString();
        vm.tahun = parseInt(EkinerjaService.IndonesianYear(new Date()));

        getLaporanBawahan();

        vm.search = function(){
            getLaporanBawahan();
        }

        vm.isKepalaSKPD = EkinerjaService.isPimpinan($.parseJSON(sessionStorage.getItem('credential')).eselon,
            $.parseJSON(sessionStorage.getItem('credential')).kdUnitKerja);

        function getLaporanBawahan(){
            PenilaianService.GetLaporanBawahan($.parseJSON(sessionStorage.getItem('credential')).nipPegawai, vm.bulan, vm.tahun).then(
                function(response){
                    vm.jmlNotifLaporanBawahan = 0;

                    // response = response.sort( function ( a, b ) { return b.tanggalDibuatMilis - a.tanggalDibuatMilis; } );
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tglPengiriman = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tglPengiriman += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].status = statusBaca(response[i].statusPenilaian);
                        // if(response[i].statusApproval) response[i].status = 'Sudah Ditandatangan';
                        if (response[i].statusPenilaian == 0){
                            vm.jmlNotifLaporanBawahan += 1;
                        }
                    }
                    vm.laporanbawahan = response;
                    vm.laporanbawahan = vm.laporanbawahan.sort( function ( a, b ) { return b.tanggalDibuatMilis - a.tanggalDibuatMilis; } );
                    vm.sortLaporan = angular.copy(vm.laporanbawahan);
                    console.log(vm.sortLaporan);
                    vm.loading = false;
                    vm.sorting();

                    pagingSortLaporan();
                }, function(errResponse){
                    vm.loading = false;
                    if(errResponse.status == -1)
                        EkinerjaService.showToastrError('Gagal Terhubung Ke Server');
                    else EkinerjaService.showToastrError('Terjadi Kesalahan');
                })
        }

        vm.teruskanLaporan = function(laporan, parentSelector){
            var parentElem = parentSelector ?
                angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'app/penilaian/openUrtug/openUrtug.html',
                controller: 'OpenUrtugController',
                controllerAs: 'openurtug',
                // windowClass: 'app-modal-window',
                // size: 'lg',
                appendTo: parentElem,
                resolve: {
                    laporan: function () {
                        return laporan;
                    }
                }
            });

            modalInstance.result.then(function () {
                getLaporanBawahan();
            }, function () {

            });
        }

        vm.approveReport = function(kdSurat){
            PenilaianService.Approve('approve-template-lain/', kdSurat).then(
                function(response){
                    EkinerjaService.showToastrSuccess('Laporan telah diterima');
                    getLaporanBawahan();
                }, function(errResponse){
                    if(errResponse.status == -1)
                        EkinerjaService.showToastrError('Gagal Terhubung Ke Server');
                    else EkinerjaService.showToastrSuccess('Terjadi kesalahan');
                })
        }

        vm.terima = function(laporan, kdSurat, isPejabat){
            switch(laporan.kdJenisSurat){
                case 0: $state.go('beritaacara', {
                    "kdSuratBawahan": kdSurat
                }); break;
                case 1: $state.go('laporan', {
                    "kdSuratBawahan": kdSurat
                }); break;
                case 2: if(laporan.suratPejabat == 1)
                    $state.go('memorandumpejabat', {
                        "kdSuratBawahan": kdSurat
                    });
                else
                    $state.go('memorandumnonpejabat', {
                        "kdSuratBawahan": kdSurat
                    }); break;
                case 3: $state.go('notadinas', {
                    "kdSuratBawahan": kdSurat
                }); break;
                case 4: $state.go('pengumuman', {
                    "kdSuratBawahan": kdSurat
                }); break;
                case 5: if(laporan.suratPejabat == 1)
                    $state.go('suratdinaspejabat', {
                        "kdSuratBawahan": kdSurat
                    });
                else
                    $state.go('suratdinasnonpejabat', {
                        "kdSuratBawahan": kdSurat
                    }); break;
                case 6: if(laporan.suratPejabat == 1)
                    $state.go('suratedaran', {
                        "kdSuratBawahan": kdSurat
                    });
                else
                    $state.go('suratedarannonpejabat', {
                        "kdSuratBawahan": kdSurat
                    }); break;
                case 7: $state.go('suratkeputusan', {
                    "kdSuratBawahan": kdSurat
                }); break;
                case 8: $state.go('suratketerangan', {
                    "kdSuratBawahan": kdSurat
                }); break;
                case 9: $state.go('suratkuasa', {
                    "kdSuratBawahan": kdSurat
                }); break;
                case 10: $state.go('suratpengantar', {
                    "kdSuratBawahan": kdSurat
                }); break;
                case 13: if(laporan.suratPejabat == 1)
                    $state.go('suratundanganpejabat', {
                        "kdSuratBawahan": kdSurat
                    });
                else
                    $state.go('suratundangannonpejabat', {
                        "kdSuratBawahan": kdSurat
                    }); break;
                case 12: $state.go('surattugas', {
                    "kdSuratBawahan": kdSurat
                }); break;
                case 14: $state.go('telaahanstaff', {
                    "kdSuratBawahan": kdSurat
                }); break;
                case 15: getLaporanLain(laporan); break;
                default: if(isPejabat == 1)
                    $state.go('perintahpejabatterusan', {
                        "kdSurat": kdSurat
                    });
                else if(isPejabat == 2)
                    $state.go('perintahnonpejabatterusan', {
                        "kdSurat": kdSurat
                    });break;
            }
        }

        function getDocumentKeputusan(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataKeputusan(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateSuratKeputusanService.template(vm.data);
                    if(isLaporan && laporan.statusPenilaian == 0)
                        openSuratMasuk('open-surat-keputusan-penilai/', laporan.kdSurat, '');
                    else openSuratMasuk('open-surat-keputusan/', laporan.kdSurat, '');
                    laporan.loading = false;
                    EkinerjaService.lihatPdf(doc, 'Surat Keputusan');
                    // pdfMake.createPdf(doc).open();
                    // if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                    //   openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };

        function getDocumentEdaran(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataEdaran(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateSuratEdaranService.template(vm.data);
                    if(isLaporan && laporan.statusPenilaian == 0)
                        openSuratMasuk('open-surat-edaran-penilai/', laporan.kdSurat, '');
                    else openSuratMasuk('open-surat-edaran/', laporan.kdSurat, '');
                    laporan.loading = false;
                    EkinerjaService.lihatPdf(doc, 'Surat Edaran');
                    // if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                    //   openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };

        function getDocumentUndangan(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataUndangan(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateSuratUndanganService.template(vm.data);
                    if(isLaporan && laporan.statusPenilaian == 0)
                        openSuratMasuk('open-surat-undangan-penilai/', laporan.kdSurat, '');
                    else openSuratMasuk('open-surat-undangan/', laporan.kdSurat, $.parseJSON(sessionStorage.getItem('credential')).nipPegawai);
                    laporan.loading = false;
                    EkinerjaService.lihatPdf(doc, 'Surat Undangan');
                    // if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                    //   openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };

        function getDocumentPengantar(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataPengantar(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateSuratPengantarService.template(vm.data);
                    if(isLaporan && laporan.statusPenilaian == 0)
                        openSuratMasuk('open-surat-pengantar-penilai/', laporan.kdSurat, '');
                    else openSuratMasuk('open-surat-pengantar/', laporan.kdSurat, '');
                    laporan.loading = false;
                    EkinerjaService.lihatPdf(doc, 'Surat Pengantar');
                    // if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                    //   openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };

        function getDocumentSuratDinas(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataSuratDinas(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateSuratDinasService.template(vm.data);
                    if(isLaporan && laporan.statusPenilaian == 0)
                        openSuratMasuk('open-surat-dinas-penilai/', laporan.kdSurat, '');
                    else openSuratMasuk('open-surat-dinas/', laporan.kdSurat, $.parseJSON(sessionStorage.getItem('credential')).nipPegawai);
                    laporan.loading = false;
                    EkinerjaService.lihatPdf(doc, 'Surat Dinas');
                    // if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                    //   openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };

        function getDocumentLaporan(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataLaporan(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateLaporanService.template(vm.data);
                    if(isLaporan && laporan.statusPenilaian == 0)
                        DashboardService.ChangeRead('open-laporan-penilai/',
                            laporan.kdSurat, $.parseJSON(sessionStorage.getItem('credential')).nipPegawai);
                    laporan.loading = false;
                    EkinerjaService.lihatPdf(doc, 'Laporan');
                    // if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                    //   openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };

        function getDocumentTelaahanStaff(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataTelaahanStaff(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateTelaahanStaffService.template(vm.data);
                    if(isLaporan && laporan.statusPenilaian == 0)
                        openSuratMasuk('open-telaahan-staff-by-penilai/', laporan.kdSurat, '');
                    laporan.loading = false;
                    EkinerjaService.lihatPdf(doc, 'Telaahan Staff');
                    // if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                    //   openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };

        function getDocumentBeritaAcara(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataBeritaAcara(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateBeritaAcaraService.template(vm.data);
                    if(isLaporan && laporan.statusPenilaian == 0)
                        openSuratMasuk('open-berita-acara-penilai/', laporan.kdSurat, $.parseJSON(sessionStorage.getItem('credential')).nipPegawai);
                    laporan.loading = false;
                    EkinerjaService.lihatPdf(doc, 'Berita Acara');
                    // if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                    //   openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };

        function getDocumentMemorandum(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataMemorandum(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateMemorandumService.template(vm.data);
                    if(isLaporan && laporan.statusPenilaian == 0)
                        openSuratMasuk('open-memorandum-by-penilai/', laporan.kdSurat, '');
                    else openSuratMasuk('open-memorandum-by-target/', laporan.kdSurat, $.parseJSON(sessionStorage.getItem('credential')).nipPegawai);
                    laporan.loading = false;
                    EkinerjaService.lihatPdf(doc, 'Memorandum');
                    // if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                    //   openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };

        function getDocumentSuratKeterangan(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataSuratKeterangan(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateSuratKeteranganService.template(vm.data);
                    if(isLaporan && laporan.statusPenilaian == 0)
                        openSuratMasuk('open-surat-keterangan-penilai/', laporan.kdSurat, '');
                    else openSuratMasuk('open-surat-keterangan/', laporan.kdSurat, $.parseJSON(sessionStorage.getItem('credential')).nipPegawai);
                    laporan.loading = false;
                    EkinerjaService.lihatPdf(doc, 'Surat Keterangan');
                    // if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                    //   openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };

        function getDocumentSuratKuasa(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataSuratKuasa(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateSuratKuasaService.template(vm.data);
                    laporan.loading = false;
                    if(isLaporan && laporan.statusPenilaian == 0)
                        openSuratMasuk('open-surat-kuasa-penilai/', laporan.kdSurat, $.parseJSON(sessionStorage.getItem('credential')).nipPegawai);
                    else openSuratMasuk('open-surat-kuasa/', laporan.kdSurat, '');
                    getLaporanBawahan();
                    EkinerjaService.lihatPdf(doc, 'Surat Kuasa');
                    // if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                    //   openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };

        function getDocumentNodin(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataNodin(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateNotaDinasService.template(vm.data);
                    if(isLaporan && laporan.statusPenilaian == 0)
                        openSuratMasuk('open-nota-dinas-by-penilai/', laporan.kdSurat, '');
                    else openSuratMasuk('open-nota-dinas/', laporan.kdSurat, $.parseJSON(sessionStorage.getItem('credential')).nipPegawai);
                    laporan.loading = false;
                    EkinerjaService.lihatPdf(doc, 'Nota Dinas');
                    // if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                    //   openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };

        function getDocumentPengumuman(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataPengumuman(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplatePengumumanService.template(vm.data);
                    if(isLaporan && laporan.statusPenilaian == 0)
                        openSuratMasuk('open-pengumuman-penilai/', laporan.kdSurat, '');
                    else openSuratMasuk('open-pengumuman/', laporan.kdSurat, '');
                    laporan.loading = false;
                    EkinerjaService.lihatPdf(doc, 'Pengumuman');
                    // pdfMake.createPdf(doc).open();
                    // pdfMake.createPdf(doc).open({}, window);
                    // if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                    //   openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };

        function getDocumentSuratTugas(laporan, isLaporan){
            // laporan.loading = true;
            PenilaianService.GetDataSuratTugas(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateSuratTugasService.template(vm.data);
                    laporan.loading = false;
                    if(isLaporan && laporan.statusPenilaian == 0)
                        openSuratMasuk('open-surat-tugas-by-penilai/', laporan.kdSurat, '');
                    EkinerjaService.lihatPdf(doc, 'Surat Tugas');
                }, function(errResponse){

                })
        };

        function openSuratMasuk(url, kdSurat,kdMemorandum, nip){console.log(url,
            kdSurat, kdMemorandum, nip);
            DashboardService.ChangeRead(url, kdSurat,kdMemorandum, nip).then(
                function(response){
                    getLaporanBawahan();
                }, function(errResponse){

                })
        }

        vm.getDocument = function(laporan, isLaporan){
            laporan.loading = true;
            
            switch(laporan.kdJenisSurat){
                case 0: getDocumentBeritaAcara(laporan, isLaporan); break;
                case 1: getDocumentLaporan(laporan, isLaporan); break;
                case 2: getDocumentMemorandum(laporan, isLaporan); break;
                case 3: getDocumentNodin(laporan, isLaporan); break;
                case 4: getDocumentPengumuman(laporan, isLaporan); break;
                case 5: getDocumentSuratDinas(laporan, isLaporan); break;
                case 6: getDocumentEdaran(laporan, isLaporan); break;
                case 7: getDocumentKeputusan(laporan, isLaporan); break;
                case 8: getDocumentSuratKeterangan(laporan, isLaporan); break;
                case 9: getDocumentSuratKuasa(laporan, isLaporan); break;
                case 10: getDocumentPengantar(laporan, isLaporan); break;
                case 12: getDocumentSuratTugas(laporan, isLaporan); break;
                case 13: getDocumentUndangan(laporan, isLaporan); break;
                case 14: getDocumentTelaahanStaff(laporan, isLaporan); break;
                case 15: getLaporanLain(laporan, isLaporan); break;
                default: vm.getDocumentPerintah(laporan, isLaporan); break;
            }
        }

        vm.tandatangan = function(laporan){
            laporan.loading = true;
            
            switch(laporan.kdJenisSurat){
                case 0: approveDocument(laporan, "approve-berita-acara/"); break;//done
                case 2: approveDocument(laporan, "approve-memorandum/"); break;//done
                case 3: approveDocument(laporan, "approve-nota-dinas/"); break;//error get
                case 4: approveDocument(laporan, "approve-pengumuman/"); break;//done
                case 5: approveDocument(laporan, "approve-surat-dinas/"); break;//done
                case 6: approveDocument(laporan, "approve-surat-edaran/"); break;//done
                case 7: approveDocument(laporan, "approve-surat-keputusan/"); break;//done
                case 8: approveDocument(laporan, "approve-surat-keterangan/"); break;//done
                case 9: approveDocument(laporan, "approve-surat-kuasa/"); break;//done
                case 10: approveDocument(laporan, "approve-surat-pengantar/"); break;//done
                case 12: approveDocument(laporan, "approve-surat-tugas/"); break;//done
                case 13: approveDocument(laporan, "approve-surat-undangan/"); break;//error get
                default: approveDocument(laporan, "approve-surat-perintah/"); break;//done
            }
        }

        function approveDocument(laporan, url){
            PenilaianService.Approve(url, laporan.kdSurat).then(
                function(response){
                    EkinerjaService.showToastrSuccess("Dokumen Berhasil Ditandatangani");
                    getLaporanBawahan();
                }, function(errResponse){
                    EkinerjaService.showToastrError(errResponse);
                    laporan.loading = false;
                })
        }

        function getSurat(){
            vm.suratMasuk = [];
            getSuratMasuk('get-nota-dinas-by-target/');
            getSuratMasuk('get-daftar-surat-dinas-by-target/');
            getSuratMasuk('get-daftar-memorandum-target/');
            getSuratMasuk('get-daftar-surat-keterangan-by-target/');
            getSuratMasuk('get-surat-kuasa-by-penerima-kuasa/');
            getSuratMasuk('get-daftar-surat-pengantar-by-target/');
            getSuratMasuk('get-daftar-surat-undangan-target/');
            // getSuratMasuk('');
        }

        function getSuratMasuk(url, count){
            DashboardService.GetSuratMasuk(url, $.parseJSON(sessionStorage.getItem('credential')).nipPegawai, false).then(
                function(response){

                    vm.jmlNotifSuratMasuk = 0;

                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].createdDateMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        vm.suratMasuk.push(response[i]);

                        if (response[i].statusBaca == 0){
                            vm.jmlNotifSuratMasuk += 1;
                        }
                    }
                    vm.suratMasuk = vm.suratMasuk.sort( function ( a, b ) { return b.createdDateMilis - a.createdDateMilis; } );
                    vm.sortSuratMasuk = angular.copy(vm.suratMasuk);

                    pagingSortSuratMasuk();
                }, function(errResponse){

                })
        }

        function getLaporanLain(laporan){
            DashboardService.GetLaporanLain(laporan.namaFileTemplateLain, laporan.extensiFile, laporan.kdSurat).then(
                function(response){
                    laporan.loading = false;debugger
                    var landingUrl = API + 'get-template-lain-file-revisi/' + laporan.namaFileTemplateLain + '/' + laporan.extensiFile + '/' + laporan.kdSurat + '/' + $.parseJSON(sessionStorage.getItem('credential')).nipPegawai;
                    $window.location.href = landingUrl;
                    getLaporanBawahan();

                }, function(errResponse){
                    laporan.loading = false;
                    getLaporanBawahan();
                    // EkinerjaService.showToastrError("Gagal Mengambil Data");
                })
        }

        // function getDocumentBeritaAcara(laporan){
        //     // laporan.loading = true;
        //     DashboardService.ChangeRead('open-berita-acara-penilai/',
        //               laporan.kdSurat, $.parseJSON(sessionStorage.getItem('credential')).nipPegawai);
        //     getLaporanBawahan();
        // };

        vm.getDocumentPerintah = function(laporan){
            // laporan.loading = true;
            PenugasanService.GetDataPerintah(laporan.kdSurat).then(
                function(response){
                    vm.data = response;
                    var doc = TemplateSuratPerintahService.template(vm.data);
                    laporan.loading = false;
                    EkinerjaService.lihatPdf(doc, 'Surat Perintah');
                    if(laporan.statusPenilaian != 2 || laporan.statusPenilaian != 3)
                        openSurat(laporan.kdSurat);
                }, function(errResponse){

                })
        };


        function openSurat(kdSurat){
            PenilaianService.OpenSurat(kdSurat).then(
                function(response){
                    getLaporanBawahan();
                }, function(errResponse){

                })
        }

        function getPerintahHistory(){
            PenugasanService.GetNaskahPenugasanPerintah($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    // response = response.sort( function ( a, b ) { return b.tanggalDibuatMilis - a.tanggalDibuatMilis; } );
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                    }
                    vm.perintahHistory = response;
                    getMemorandumHistory();
                },function(errResponse){

                })
        }

        function getUndanganHistory(){
            PenilaianService.GetUndanganHistory($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].suratPejabat = response.isSuratPejabat;
                        response[i].jenisSurat = "surat undangan";
                        vm.perintahHistory.push(response[i]);
                    }
                    vm.perintahHistory = vm.perintahHistory.sort( function ( a, b ) { return b.tanggalDibuatMilis - a.tanggalDibuatMilis; } );
                    vm.sortHistory = angular.copy(vm.perintahHistory);

                    pagingSortHistory();
                })
        }

        function getPengumumanHistory(){
            PenilaianService.GetPengumumanHistory($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].suratPejabat = response.isSuratPejabat;
                        response[i].jenisSurat = "pengumuman";
                        vm.perintahHistory.push(response[i]);
                    }
                    getUndanganHistory();
                })
        }

        function getEdaranHistory(){
            PenilaianService.GetEdaranHistory($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].suratPejabat = response.isSuratPejabat;
                        response[i].jenisSurat = "surat edaran";
                        vm.perintahHistory.push(response[i]);
                    }
                    getPengumumanHistory();
                })
        }

        function getKeputusanHistory(){
            PenilaianService.GetKeputusanHistory($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].suratPejabat = response.isSuratPejabat;
                        response[i].jenisSurat = "surat keputusan";
                        vm.perintahHistory.push(response[i]);
                    }
                    getEdaranHistory();
                })
        }

        function getPengantarHistory(){
            PenilaianService.GetPengantarHistory($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].suratPejabat = response.isSuratPejabat;
                        response[i].jenisSurat = "surat pengantar";
                        vm.perintahHistory.push(response[i]);
                    }
                    getKeputusanHistory();
                })
        }

        function getBeritaAcaraHistory(){
            PenilaianService.GetBeritaAcaraHistory($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].suratPejabat = response.isSuratPejabat;
                        response[i].jenisSurat = "berita acara";
                        vm.perintahHistory.push(response[i]);
                    }
                    getPengantarHistory();
                })
        }

        function getLaporanHistory(){
            PenilaianService.GetLaporanHistory($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].suratPejabat = response.isSuratPejabat;
                        response[i].jenisSurat = "laporan";
                        vm.perintahHistory.push(response[i]);
                    }
                    getBeritaAcaraHistory();
                })
        }

        function getNotaDinasHistory(){
            PenilaianService.GetNotaDinasHistory($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].suratPejabat = response.isSuratPejabat;
                        response[i].jenisSurat = "nota dinas";
                        vm.perintahHistory.push(response[i]);
                    }
                    getLaporanHistory();
                })
        }

        function getSuratDinasHistory(){
            PenilaianService.GetSuratDinasHistory($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].suratPejabat = response.isSuratPejabat;
                        response[i].jenisSurat = "surat dinas";
                        vm.perintahHistory.push(response[i]);
                    }
                    getNotaDinasHistory();
                })
        }

        function getKeteranganHistory(){
            PenilaianService.GetKeteranganHistory($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].suratPejabat = response.isSuratPejabat;
                        response[i].jenisSurat = "surat keterangan";
                        vm.perintahHistory.push(response[i]);
                    }
                    getSuratDinasHistory();
                })
        }

        function getKuasaHistory(){
            PenilaianService.GetKuasaHistory($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    for(var i = 0; i < response.length;i++){ 
                        var date = new Date(response[i].tanggalDibuatMilis);
                        // response[i].tanggalDibuatMilis = response[i].createdDate;
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].suratPejabat = response.isSuratPejabat;
                        response[i].jenisSurat = "surat kuasa";
                        vm.perintahHistory.push(response[i]);
                    }
                    getKeteranganHistory();
                })
        }

        function getTelaahStaffHistory(){
            PenilaianService.GetTelaahStaffHistory($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].suratPejabat = response.isSuratPejabat;
                        response[i].jenisSurat = "telaahan staff";
                        vm.perintahHistory.push(response[i]);
                    }
                    getKuasaHistory();
                })
        }

        function getMemorandumHistory(){ 
            PenilaianService.GetMemorandumHistory($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
                function(response){
                    for(var i = 0; i < response.length;i++){
                        var date = new Date(response[i].tanggalDibuatMilis);
                        response[i].tanggalDibuat = EkinerjaService.IndonesianDateFormat(date);
                        response[i].tanggalDibuat += " pukul " + date.getHours() + ":" + date.getMinutes();
                        response[i].suratPejabat = response.isSuratPejabat;
                        response[i].jenisSurat = "memorandum";
                        vm.perintahHistory.push(response[i]);
                    }
                    getTelaahStaffHistory();
                })
        }

        function openTeruskanTemplate(laporan, parentSelector) {
            var parentElem = parentSelector ?
                angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'app/penilaian/teruskanTemplate/teruskanTemplate.html',
                controller: 'TeruskanTemplateController',
                controllerAs: 'uptempterus',
                // windowClass: 'app-modal-window',
                // size: 'lg',
                appendTo: parentElem,
                resolve: {
                    template: function () {
                        return laporan;
                    }
                }
            });

            modalInstance.result.then(function () {
                getLaporanBawahan();
            }, function () {

            });
        };

        vm.tolak = function(data, parentSelector){
            var item = angular.copy(data);
            var parentElem = parentSelector ?
                angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'app/penilaian/alasan/alasan.html',
                controller: 'AlasanController',
                controllerAs: 'alasan',
                // size: size,
                appendTo: parentElem,
                resolve: {
                    items: function () {
                        return item;
                    }
                }
            });

            modalInstance.result.then(function () {
                EkinerjaService.showToastrSuccess("Laporan Telah Ditolak");
                getLaporanBawahan();
                // vm.selected = selectedItem;
            }, function () {
                // showToastrFailed('menambahkan data');
                // $log.info('Modal dismissed at: ' + new Date());
            });
        }

        vm.sorting = function(){
            switch(vm.lihat){
                case "0": vm.sortLaporan = angular.copy(vm.laporanbawahan);
                    vm.sortSuratMasuk = angular.copy(vm.suratMasuk);
                    vm.sortHistory = angular.copy(vm.perintahHistory); break;
                case "1": if(vm.tanggal != undefined) vm.sortDate(); break;
                case "2": if(vm.jenis != undefined) vm.sortJenis(); break;
                case "3": vm.sortLaporan = [];
                    vm.sortSuratMasuk = [];
                    vm.sortHistory = [];
                    findStatusBaca(0); break;
                case "4": vm.sortLaporan = [];
                    vm.sortSuratMasuk = [];
                    vm.sortHistory = [];
                    findStatusBaca(1); break;
                case "5": vm.sortLaporan = [];
                    vm.sortSuratMasuk = [];
                    vm.sortHistory = [];
                    findStatusBaca(3); break;
                case "6": vm.sortLaporan = [];
                    vm.sortSuratMasuk = [];
                    vm.sortHistory = [];
                    findStatusBaca(2); break;
            }
        }

        vm.sortDate = function(){
            vm.sortLaporan = [];
            vm.sortSuratMasuk = [];
            vm.sortHistory = [];

            for(var i = 0; i < vm.laporanbawahan.length; i++){
                if(vm.tanggal.getDate() == new Date(vm.laporanbawahan[i].tanggalDibuatMilis).getDate() &&
                    vm.tanggal.getMonth() == new Date(vm.laporanbawahan[i].tanggalDibuatMilis).getMonth() &&
                    vm.tanggal.getYear() == new Date(vm.laporanbawahan[i].tanggalDibuatMilis).getYear())
                    vm.sortLaporan.push(vm.laporanbawahan[i]);
            }

            for(var i = 0; i < vm.suratMasuk.length; i++){
                if(vm.tanggal.getDate() == new Date(vm.suratMasuk[i].createdDateMilis).getDate() &&
                    vm.tanggal.getMonth() == new Date(vm.suratMasuk[i].createdDateMilis).getMonth() &&
                    vm.tanggal.getYear() == new Date(vm.suratMasuk[i].createdDateMilis).getYear())
                    vm.sortSuratMasuk.push(vm.suratMasuk[i]);
            }

            for(var i = 0; i < vm.perintahHistory.length; i++){
                if(vm.tanggal.getDate() == new Date(vm.perintahHistory[i].tanggalDibuatMilis).getDate() &&
                    vm.tanggal.getMonth() == new Date(vm.perintahHistory[i].tanggalDibuatMilis).getMonth() &&
                    vm.tanggal.getYear() == new Date(vm.perintahHistory[i].tanggalDibuatMilis).getYear())
                    vm.sortHistory.push(vm.perintahHistory[i]);
            }
        }

        vm.sortJenis = function(){
            vm.sortLaporan = [];
            vm.sortSuratMasuk = [];
            vm.sortHistory = [];

            for(var i = 0; i < vm.laporanbawahan.length; i++){
                if(vm.jenis == vm.laporanbawahan[i].kdJenisSurat)
                    vm.sortLaporan.push(vm.laporanbawahan[i]);
            }

            for(var i = 0; i < vm.suratMasuk.length; i++){
                if(vm.jenis == vm.suratMasuk[i].kdJenisSurat)
                    vm.sortLaporan.push(vm.suratMasuk[i]);
            }

            for(var i = 0; i < vm.perintahHistory.length; i++){
                if(vm.jenis == vm.vm.perintahHistory[i].kdJenisSurat)
                    vm.sortLaporan.push(vm.vm.perintahHistory[i]);
            }

        }

        function findStatusBaca(value){
            for(var i = 0; i < vm.laporanbawahan.length; i++){
                if(vm.laporanbawahan[i].statusPenilaian == value)
                    vm.sortLaporan.push(vm.laporanbawahan[i]);
                
            }

            for(var j = 0; j < vm.suratMasuk.length; j++){
                if(vm.suratMasuk[j].statusBaca == value)
                    vm.sortSuratMasuk.push(vm.suratMasuk[j]);
                
            }

            for(var k = 0; k < vm.perintahHistory.length; k++){
                if(vm.perintahHistory[k].statusPenilaian == value)
                    vm.sortHistory.push(vm.perintahHistory[k]);
                
            }
        }

        function pagingSortLaporan(){
            $scope.filteredDataSortLaporan = [];
            $scope.currentPageSortLaporan = 0;
            $scope.numPerPageSortLaporan = 10;
            $scope.maxSizeSortLaporan = Math.ceil(vm.sortLaporan.length/$scope.numPerPageSortLaporan);
            function pageSortLaporan(){
                $scope.pageSortLaporan = [];
                for(var i = 0; i < vm.sortLaporan.length/$scope.numPerPageSortLaporan; i++){
                    $scope.pageSortLaporan.push(i+1);
                }
            }
            pageSortLaporan();
            $scope.padSortLaporan = function(i){
                $scope.currentPageSortLaporan += i;
            }

            $scope.maxSortLaporan = function(){
                if($scope.currentPageSortLaporan >= $scope.maxSizeSortLaporan - 1)
                    return true;
                else return false;
            }

            $scope.$watch("currentPageSortLaporan + numPerPageSortLaporan", function() {
                var begin = (($scope.currentPageSortLaporan) * $scope.numPerPageSortLaporan)
                    , end = begin + $scope.numPerPageSortLaporan;

                $scope.filteredDataSortLaporan = vm.sortLaporan.slice(begin, end);
            });
        }

        function pagingSortSuratMasuk(){
            $scope.filteredDataSortSuratMasuk = [];
            $scope.currentPageSortSuratMasuk = 0;
            $scope.numPerPageSortSuratMasuk = 10;
            $scope.maxSizeSortSuratMasuk = Math.ceil(vm.sortSuratMasuk.length/$scope.numPerPageSortSuratMasuk);
            function pageSortSuratMasuk(){
                $scope.pageSortSuratMasuk = [];
                for(var i = 0; i < vm.sortSuratMasuk.length/$scope.numPerPageSortSuratMasuk; i++){
                    $scope.pageSortSuratMasuk.push(i+1);
                }
            }
            pageSortSuratMasuk();
            $scope.padSortSuratMasuk = function(i){
                $scope.currentPageSortSuratMasuk += i;
            }

            $scope.maxSortSuratMasuk = function(){
                if($scope.currentPageSortSuratMasuk >= $scope.maxSizeSortSuratMasuk - 1)
                    return true;
                else return false;
            }

            $scope.$watch("currentPageSortSuratMasuk + numPerPageSortSuratMasuk", function() {
                var begin = (($scope.currentPageSortSuratMasuk) * $scope.numPerPageSortSuratMasuk)
                    , end = begin + $scope.numPerPageSortSuratMasuk;

                $scope.filteredDataSortSuratMasuk = vm.sortSuratMasuk.slice(begin, end);
            });
        }

        function pagingSortHistory(){
            $scope.filteredDataSortHistory = [];
            $scope.currentPageSortHistory = 0;
            $scope.numPerPageSortHistory = 10;
            $scope.maxSizeSortHistory = Math.ceil(vm.sortHistory.length/$scope.numPerPageSortHistory);
            function pageSortHistory(){
                $scope.pageSortHistory = [];
                for(var i = 0; i < vm.sortHistory.length/$scope.numPerPageSortHistory; i++){
                    $scope.pageSortHistory.push(i+1);
                }
            }
            pageSortHistory();
            $scope.padSortHistory = function(i){
                $scope.currentPageSortHistory += i;
            }

            $scope.maxSortHistory = function(){
                if($scope.currentPageSortHistory >= $scope.maxSizeSortHistory - 1)
                    return true;
                else return false;
            }

            $scope.$watch("currentPageSortHistory + numPerPageSortHistory", function() {
                var begin = (($scope.currentPageSortHistory) * $scope.numPerPageSortHistory)
                    , end = begin + $scope.numPerPageSortHistory;

                $scope.filteredDataSortHistory = vm.sortHistory.slice(begin, end);
            });
        }

        vm.isAdmin = function(){
            if($.parseJSON(sessionStorage.getItem('credential')).role.id != 'AD004')
                return false;
            else return true;
        }

        function statusBaca(status){
          switch (status) {
            case 0 : return 'Belum Dibaca'; break;
            case 1 : return 'Sudah Dibaca'; break;
            case 2 : return 'Sudah Diterima'; break;
            case 3 : return 'Ditolak'; break;
          }
        }
    }
})();