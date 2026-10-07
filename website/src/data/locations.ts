import {properties,type Property} from './properties';
export type StayLocation={id:string;name:string;address:string;properties:Property[]};
const groups=new Map<string,StayLocation>();
for(const property of properties){const key=`${property.area}|${property.address}`;const existing=groups.get(key);if(existing)existing.properties.push(property);else groups.set(key,{id:`location-${groups.size+1}`,name:property.location,address:property.address,properties:[property]});}
export const locations=[...groups.values()];
