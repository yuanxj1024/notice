/**
 * Created by AaronYuan on 4/21/15.
 */
/// <reference path="plugins.ts" />
module missfresh {
    'use strict';

    export interface IRPWindow extends  IMFWindow {
        UIPickerView:any;
        CAAnimation:any;
    }



    declare
    var window:IRPWindow;
    var UIPickerView = window.UIPickerView;
    var CAAnimation = window.CAAnimation;

    var selectedRegion:any = {
        province:null,
        city:null,
        area:null
    };

    var tempSelected = {
        province:null,
        city:null,
        area:null
    };


    var pickers:any = {
        wrapper:null,
        province:null,
        city:null,
        area:null
    };

    interface ISelectedRegion {
        code:string;
        level:number;
    }

    class PickerData {
        constructor(public key:string,public value:string){
        }
    }

    interface ICellSetting {
        kUPCELLHEIGHT:number;
        kUPFRICTION:number;
    }

    class PickerArgument {
        constructor(
            public dataSource:Array<PickerData>,
            public id:string,
            public constraintsId:string,
            public valueChange:any = ()=>{},
            public kUP:ICellSetting = {
                kUPCELLHEIGHT:30,
                kUPFRICTION:0.003
            }
        ){

        }
    }
    class Region {
        successFn:any;
        cancelFn:any;
        constructor(){
        }

        show(selectedRegion:ISelectedRegion,regions,successFn,cancelFn):void {
            this.successFn = successFn;
            this.cancelFn = cancelFn;
            var self = this;
            setTimeout(function(){
                self.findSelectedItem(regions,selectedRegion);
                self.createPicker(regions,null,'province');
                if(!pickers.wrapper) {
                    pickers.wrapper = CAAnimation.createAnimation({id: 'region-picker'});
                }
                var scroll = document.getElementById('region-picker').parentNode;
                if(scroll){
                    scroll['style'].cssText = '-webkit-transform: translate3d(0px, 0px, 0px) scale(1);';
                }
                if(!pickers.wrapper.isShowed){
                    pickers.wrapper.start();
                    self.bindEvent();
                }
            },300);
        }

        bindEvent(){
           document.addEventListener('click',this.inputClickHandle,false);
        }

        inputClickHandle(event:any):void {
            var oEvent = event ? event : window.event;
            var oElem = oEvent.toElement;

            var nodeValue = oElem.attributes['ng-model'] ? oElem.attributes['ng-model'].nodeValue: '';
            if(oElem.nodeName == 'INPUT' || oElem.nodeName == 'TEXTAREA') {
                if(nodeValue != 'regionName'){
                    pickers.wrapper.finish();
                }
            }
        }

        removeEvent(){
            document.removeEventListener('click',this.inputClickHandle,false);
        }

        createPicker(regions, data,type) {
            var self = this;
            var list = [],
                index = 1;
            switch (type) {
                case 'province':
                    list = self.getRegionList(regions,1,'province');
                    if(!pickers.province){
                        pickers.province = UIPickerView.createPickerView(new PickerArgument(
                            list,
                            'provincePicker',
                            'provinceCons',
                            function(data){
                                if(selectedRegion.province && data.key == selectedRegion.province.key){
                                    return;
                                }
                                self.createPicker(regions,data.key,'city');
                                selectedRegion.province = data;
                            }
                        ));
                    } else {
                        pickers.province.UPRender(list);
                    }
                    if(tempSelected.province){
                        index = self.getItemIndex(list,tempSelected.province.key);
                    }
                    pickers.province.UPSelectRowIndexPath(index).UPThen();
                    break;
                case 'city':
                    list = self.getRegionList(regions,data,'city');
                    if(!pickers.city){
                        pickers.city = UIPickerView.createPickerView(new PickerArgument(
                            list,
                            'cityPicker',
                            'cityCons',
                            function(data){
                                if(selectedRegion.city && data.key == selectedRegion.city.key){
                                    return;
                                }
                                selectedRegion.city = data;
                                self.createPicker(regions,data.key,'area');
                            }
                        ));
                    } else {
                        pickers.city.UPRender(list);
                    }
                    if(tempSelected.city){
                        index = self.getItemIndex(list, tempSelected.city.key);
                    }
                    pickers.city.UPSelectRowIndexPath(index).UPThen();
                    break;
                case 'area':
                    list = self.getRegionList(regions,data,'area');
                    if(!pickers.area){
                        pickers.area = UIPickerView.createPickerView(new PickerArgument(
                            list,
                            'areaPicker',
                            'areaCons',
                            function(data){
                                if(selectedRegion.area && data.key == selectedRegion.area.key){
                                    return;
                                }
                                selectedRegion.area = data;
                            }
                        ));
                    } else {
                        pickers.area.UPRender(list);
                    }
                    if(tempSelected.area){
                        index = self.getItemIndex(list, tempSelected.area.key);
                    }
                    pickers.area.UPSelectRowIndexPath(index).UPThen();
                    break;
            }
        }

        findSelectedItem(regions,data){
            if(!data){
                return null;
            }
            var item = regions[data.code];
            tempSelected.area = new PickerData(data.code,item[0]);
            var temp = item;
            item = regions[temp[1]];
            tempSelected.city = new PickerData(temp[1],item[0]);

            temp = item;
            item = regions[temp[1]];
            tempSelected.province = new PickerData(temp[1],item[0]);
        }

        getItemIndex(list,key){
            var index = 1;
            for(var i = 1; i <= list.length; i++){
                if(list[i-1].key == key){
                    index = i;
                    break;
                }
            }
            return index;
        }

        getRegionList(regions:Array<any>, parentId:number, tyep:string) :Array<PickerData>{
            var result:Array<any> = [];
            for(var id in regions){
                var item = new PickerData(id, regions[id][0]);
                if(parentId == regions[id][1]){
                    result.push(item);
                }
            }
            return result;
        }
        destroy() {
            this.close();
            this.removeEvent();

            if(pickers.wrapper) {
                pickers.wrapper.removeEvent();
            }
            pickers = {
                wrapper:null,
                province:null,
                city:null,
                area:null
            };
            tempSelected = {
                province:null,
                city:null,
                area:null
            };
            selectedRegion = {
                province:null,
                city:null,
                area:null
            };
        }
        close() {
            if(pickers && pickers.wrapper) {
                pickers.wrapper.finish();
            }
        }
        done(callback) {
            var name = selectedRegion.province.value + ' ' + selectedRegion.city.value + ' ' + selectedRegion.area.value;
            this['successFn'] && this.successFn({
                province:{
                    name: selectedRegion.province.value,
                    id: selectedRegion.province.key
                },
                city:{
                    name: selectedRegion.city.value,
                    id: selectedRegion.city.key
                },
                area:{
                    name: selectedRegion.area.value,
                    id: selectedRegion.area.key
                }
            });
            callback && callback(name);
            this.close();
            return selectedRegion.area;
        }
    }


    pluginManager.register('window.region', new Region());
}