import { ATTRIBUTE_ID, ICONSDIR, IMG_DICE } from './constants.js'
export let SavageActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    SavageActionHandler = class SavageActionHandler extends coreModule.api.ActionHandler {

        /** @override */
        async buildSystemActions(groupIds) {

            const token = this.token;
            if (!token) return;
            const tokenId = token.id;
            const actor = this.actor;
            if (!actor) return;

            this._getAttributes({ id: 'attributes', type: 'system' });
            this._getSkills({ id: 'skills', type: 'system' });
            ["powers", "weapons", 'consumables', 'gears', 'actions'].forEach(element => {

                this._getItems({ id: element, type: 'system' }, element.slice(0, -1))
            })

            this._getUtilities({ id: "utility", type: 'system'})
            this._getStatuses({ id: "statuses", type: 'system'})
            this._powerpoints({ id: 'powerpoints', type: 'system' })
            this._effects()

        }
        _effects() {
            let temporary = { id: 'effectstemp', type: 'system' }
            let permanent = { id: 'effectsperm', type: 'system' }
            let ignore = [
                coreModule.api.Utils.i18n('SWADE.Shaken'),
                coreModule.api.Utils.i18n('SWADE.Distr'),
                coreModule.api.Utils.i18n('SWADE.Vuln'),
                coreModule.api.Utils.i18n('SWADE.Stunned'),
                coreModule.api.Utils.i18n('SWADE.Entangled'),
                coreModule.api.Utils.i18n('SWADE.Bound'),
                coreModule.api.Utils.i18n('SWADE.Incap')
            ]

            let effects = Array.from(this.actor.effects)
            effects.forEach( eff => {
                let group = temporary
                if(eff.isTemporary == false) {
                    group = permanent
                }
                
                if(!ignore.includes(eff.name)) {
                    this.addActions([{
                        id:'ef'+eff.name,
                        name: eff.name,
                        img: eff.icon,
                        cssClass: eff.disabled ? "toggle" : "togle active",
                        description: eff.name,
                        encodedValue: ['effects', eff.id].join(this.delimiter),
                        info2: { text: coreModule.api.Utils.i18n('SWADE.Dur')+": "+eff.duration.label }
                    }], group);
                }

            })
        }
        _powerpoints(parent) {
            if((this.actor.items.filter(i => i.type === 'power')).length == 0) return;
           
            let groups = Object.entries(this.actor.system.powerPoints)

            const powers = this.actor.items.filter((power) => power.type === "power")
            groups.forEach(group => {
                let arcane = group[0]
                if(group[0] === 'general') arcane = ''
                let g_powers = powers.filter((power) => power.system.arcane === arcane)
                if(g_powers.length > 0) {
                    const newg = { id: 'pp'+group[0], name: group[0], type: 'system' }
                    this.addGroup( newg,parent)
                    let actions = [ ]
                    actions.push({
                        id:'ppread'+group[0],
                        name: group[0],
                        img: IMG_DICE+"pp.webp",
                        cssClass: "disabled",
                        description: coreModule.api.Utils.i18n('SWADE.PP'),
                        encodedValue: ['powerPoints', 'NONE'].join(this.delimiter),
                        info1: { text: String(group[1].value) +"/"+String(group[1].max) }
                    })
                    
                    let encodevalue = 'add>'+group[0]
                    actions.push({
                        id:'ppAdd'+group[0],
                        name: "",
                        cssClass: "",
                        icon1: '<i class="fa fa-plus" aria-hidden="true"></i>',
                        description: coreModule.api.Utils.i18n('SWADE.PP'),
                        encodedValue: ['powerPoints', encodevalue].join(this.delimiter)
                    })
                    
                    encodevalue = 'remove>'+group[0]
                    actions.push({
                        id:'ppRemove'+group[0],
                        name: "",
                        cssClass: "",
                        icon1: '<i class="fa fa-minus" aria-hidden="true"></i>',
                        description: coreModule.api.Utils.i18n('SWADE.PP'),
                        encodedValue: ['powerPoints', encodevalue].join(this.delimiter)
                    })
                    

                    this.addActions(actions, newg);
                }
            })
        }
        _getItems(parent, itemtype) {
            let items = []
            let items_favorities = []

            let item_list = this.actor.items.filter(i => i.type === itemtype)
            item_list.forEach(el => {
                let element = {
                    id: el.id,
                    img: el.img,
                    name: el.name,
                    description: el.system.description,
                    encodedValue: [parent.id, el.id, el.id].join(this.delimiter)
                }
                if (["power", "weapon"].includes(el.type) && el.system.damage) {
                    element.info1 = { text: el.system.damage }
                } else if (el.system.die) {
                    element.info1 = { text: SavageActionHandler._buildDieString(el.system.die) }
                } else if (el.type == 'consumable') {
                    element.info1 = { text: el.system.charges.value + "/" + el.system.charges.max }
                }
                if (el.system.favorite == true) {
                    items_favorities.push(element)
                } else {
                    items.push(element)
                }
            })
            this.addActions(items, parent)
            this.addActions(items_favorities, { id: parent.id + 'favorite', type: parent.type })
        }
        _getSkills(parent) {

            let skills = this.actor.items.filter(i => i.type === "skill")
            let actions = skills.map(element => {
                return {
                    id: element.id,
                    name: element.name,
                    img: element.img,
                    description: element.system.description,
                    encodedValue: ['skills', element.id].join(this.delimiter),
                    info1: { text: SavageActionHandler._buildDieString(element.system.die) }
                }

            });
            this.addActions(actions, parent)
        }
        _getAttributes(parent) {
            this.addGroup( { id: 'derivedstats', name: coreModule.api.Utils.i18n('SWADE.Derived'), type: 'system' },{id :'attributes', type: 'custom'})
            const macroType = "attributes";
            let actions = []
            
            let attributes = Object.entries(this.actor.system.attributes)
            attributes.push("run")
            attributes.forEach((a) => {
                if(a == 'run') {
                    let img = this.actor.system.stats.speed.runningDie
                    if(typeof img === 'undefined') {
                        img = '4'
                    }
                    let action = {
                        id:'run',
                        name: coreModule.api.Utils.i18n('SWADE.Running'),
                        img: IMG_DICE + 'd' + img + '.svg',
                        description: coreModule.api.Utils.i18n('SWADE.Running'),
                        encodedValue: ['runningDie', 'runningDie'].join(this.delimiter),
                        //info1: { text: /*SavageActionHandler._buildDieString(data.die)*/ }
                    };
                    let child = {id: 'derivedstats', type: 'system'}
                    this.addActions([action],child)
                } else {
                    const key = a[0];
                    const data = a[1];
                    let img = IMG_DICE + 'd' + data.die.sides + '.svg'
                    actions.push({
                        id:key,
                        name: coreModule.api.Utils.i18n(key),
                        img: img,
                        description: coreModule.api.Utils.i18n('SWADE.Attributes'),
                        encodedValue: [macroType, key].join(this.delimiter),
                       //info1: { text: SavageActionHandler._buildDieString(data.die) }
                    })
                }
            })
            this.addActions(actions, parent)
        }

        _getWounds() {
            let actions = [ ]
            let parent = {id: 'wounds', type: 'system' };
            actions.push({
                id:'Wounds',
                name: coreModule.api.Utils.i18n('SWADE.Wounds'),
                img: IMG_DICE+"wound.webp",
                //img: game.settings.get("swade", "bennyImageSheet"),
                cssClass: "disabled",
                description: coreModule.api.Utils.i18n('SWADE.Wounds'),
                encodedValue: ['wounds', 'NONE'].join(this.delimiter),
                info1: { text: String(this.actor.system.wounds.value) +"/"+String(this.actor.system.wounds.max) }
            })
            

            actions.push({
                id:'WoundsAdd',
                name: "",
                cssClass: "",
                //img: IMG_DICE+"plus.webp",
                icon1: '<i class="fa fa-plus" aria-hidden="true"></i>', // IMG_DICE+"plus.webp",
                description: coreModule.api.Utils.i18n('SWADE.Wounds'),
                encodedValue: ['wounds', 'add'].join(this.delimiter)
                //info1: { text: String(this.actor.system.wounds.value) }
            })
            if(this.actor.system.wounds.value > 0) {
                actions.push({
                    id:'WoundsRemove',
                    name: "",
                    cssClass: "",
                    icon1: '<i class="fa fa-minus" aria-hidden="true"></i>', // IMG_DICE+"plus.webp",
                    description: coreModule.api.Utils.i18n('SWADE.Wounds'),
                    encodedValue: ['wounds', 'remove'].join(this.delimiter)
                    //info1: { text: String(this.actor.system.wounds.value) }
                })
            }

            this.addActions(actions, parent);

        }
        async _getFatigue() {
            let parent = {id: 'fatigue', type: 'system' };
            let actions = []
            actions.push({
                id:'fatigue',
                name: coreModule.api.Utils.i18n('SWADE.Fatigue'),
                img: IMG_DICE+"fatigue.webp",
                //img: game.settings.get("swade", "bennyImageSheet"),
                cssClass: "disabled",
                description: coreModule.api.Utils.i18n('SWADE.Fatigue'),
                encodedValue: ['fatigue', 'NONE'].join(this.delimiter),
                info1: { text: String(this.actor.system.fatigue.value) +"/"+String(this.actor.system.fatigue.max) }
            })
            actions.push({
                id:'FatigueAdd',
                name: "",
                cssClass: "",
                icon1: '<i class="fa fa-plus" aria-hidden="true"></i>', // IMG_DICE+"plus.webp",
                description: coreModule.api.Utils.i18n('SWADE.Fatigue'),
                encodedValue: ['fatigue', 'add'].join(this.delimiter)
            
            })
            
            if(this.actor.system.fatigue.value > 0) {
                actions.push({
                    id:'FatigueRemove',
                    name: "",
                    cssClass: "",
                    icon1: '<i class="fa fa-minus" aria-hidden="true"></i>', // IMG_DICE+"plus.webp",
                    description: coreModule.api.Utils.i18n('SWADE.Fatigue'),
                    encodedValue: ['fatigue', 'remove'].join(this.delimiter)
                
                })
            }
            

            this.addActions(actions, parent);

        }
        _getStatuses(parent) {
            let actions = [];
            ['Shaken', 'Distr', 'Vuln', 'Stunned', 'Entangled', 'Bound', 'Incap'].forEach(el => {
                let fullname = coreModule.api.Utils.i18n('SWADE.'+el)
                //let img = ICONSDIR+"/status/status_"+fullname.toLocaleLowerCase()+".svg";
                let img = CONFIG.statusEffects.find((el) => el.id === fullname.toLocaleLowerCase())?.icon ?? null;
                //if(el == "Incap") img = "systems/swade/assets/ui/incapacitated.svg";
                
                let en = this.actor.statuses.has(fullname.toLowerCase()) ? "remove" : "add";
                let action =  {
                    id: fullname.toLowerCase(),
                    name: fullname,
                    cssClass: this.actor.statuses.has(fullname.toLowerCase()) ? "toggle active" : "togle",
                    img: img,
                    description: fullname,
                    encodedValue: ['statuses', fullname].join(this.delimiter)
                    //info1: { text: String(this.actor.system.wounds.value) }
                }
                actions.push(action)
            })
            this.addActions(actions, parent); 


        }
        
        _getUtilities(parent){
            const bennies = this.actor.system.bennies
            if(bennies.value > 0) {
                let action =  {
                    id:'spend',
                    name: coreModule.api.Utils.i18n('SWADE.BenniesSpend'),
                    img: game.settings.get("swade", "bennyImageSheet"),
                    description: coreModule.api.Utils.i18n('SWADE.BenniesSpend'),
                    encodedValue: ['benny', 'spend'].join(this.delimiter),
                    info1: { text: this.actor.system.bennies.value }
                }
                let actions = [ action ]
                this.addActions(actions, {id: 'benny', type: 'system' });
            }
            this._getWounds()
            this._getFatigue()

            if(game.user.isGM) {
                let action =  {
                    id:'give',
                    name: coreModule.api.Utils.i18n('SWADE.BenniesGive'),
                    img: game.settings.get("swade", "bennyImageSheet"),
                    description: coreModule.api.Utils.i18n('SWADE.BenniesGive'),
                    encodedValue: ['benny', 'give'].join(this.delimiter)
                    //info1: { text: this.actor.system.bennies.value }
                }
                let actions = [ action ]
                this.addActions(actions, {id: 'benny', type: 'system' });
            }

        }
        static _buildDieString(die = {}) {
            if (!die) return "";
            const result = `d${die.sides}`;
            const mod = parseInt(die.modifier);
            if (!die.modifier || mod === 0) {
                return result;
            }
            const dieMod = mod > 0 ? `+${mod}` : `${mod}`;
            return `${result}${dieMod}`;
        }


    }
})