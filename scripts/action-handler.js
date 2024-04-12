import { ATTRIBUTE_ID, ICONSDIR, IMG_DICE, init_help_buttons, MAIN_ACTIONS, FREE_ACTIONS } from './constants.js'
export let SavageActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    SavageActionHandler = class SavageActionHandler extends coreModule.api.ActionHandler {

        /** @override */
        async buildSystemActions(groupIds) {
            init_help_buttons(this.delimiter)
            const token = this.token;
            if (!token) return;
            const tokenId = token.id;
            const actor = this.actor;
            if (!actor) return;
            
            if(["npc", "character"].includes(actor.type)) {

                this._getAttributes({ id: 'attributes', type: 'system' });
                this._getSkills({ id: 'skills', type: 'system' });
                ["powers", "weapons", 'consumables', 'gears', 'actions'].forEach(element => {

                    this._getItems({ id: element, type: 'system' }, element.slice(0, -1))
                })
                this._getArmorShield();

                this._getUtilities({ id: "utility", type: 'system'})
                this._powerpoints({ id: 'powerpoints', type: 'system' })
                let default_statuses = []
                CONFIG.statusEffects.forEach(item => {
                    default_statuses.push(item.id)
                    })
                this._effects(default_statuses)
                this._helpme()
            } else if (actor.type == "vehicle") {
                ["weapons"].forEach(element => {
                    this._getSkills({ id: 'skills', type: 'system' });
                    this._getItems({ id: element, type: 'system' }, element.slice(0, -1))
                })
            }
        }
        _helpme() {
            this.addActions(MAIN_ACTIONS, { id: 'mainactions', type: 'system' })
            this.addActions(FREE_ACTIONS, { id: 'freeactions', type: 'system' })
        }
        _activeEffects(parent, category) {
            const items = Array.from(this.actor.items.filter(it => [category].includes(it.type)))

            items.forEach(item => {
                const effects = Array.from(item.effects)
                effects.forEach(effect => {
                    this.addActions([{
                        id:'ac'+effect.id,
                        name: effect.name,
                        img: effect.icon,
                        cssClass: effect.disabled ? "toggle" : "togle active",
                        description: effect.name,
                        encodedValue: ['ae', effect.id,effect.disabled,item.id].join(this.delimiter),
                        info2: { text: item.type+": "+item.name }
                    }], parent);
                })
            })
        }
        _effects(default_statuses) {
            let temporary = { id: 'effectstemp', type: 'system' }
            let permanent = { id: 'effectsperm', type: 'system' }

            let effects = Array.from(this.actor.effects)
            const items = Array.from(this.actor.items.filter(it => ['edge', 'hindrance', 'ability'].includes(it.type)))
            items.forEach(item => {
                let _eff = Array.from(item.effects)
                if(_eff.length > 0) effects = effects.concat(effects, _eff)
            })
            effects.forEach( eff => {
                let group = temporary
                if(eff.isTemporary == false) {
                    group = permanent
                }
                
                if(!default_statuses.includes(eff.name)) {
                    this.addActions([{
                        id:'ef'+eff.name,
                        name: eff.name,
                        img: eff.icon,
                        cssClass: eff.disabled ? "toggle" : "togle active",
                        description: eff.name,
                        encodedValue: ['effects', eff.id].join(this.delimiter),
                        info2: { text: group.id == 'effectstemp' ? coreModule.api.Utils.i18n('SWADE.Dur')+": "+eff.duration.label : '' }
                    }], group);
                }

            })
            this._getStatuses({ id: 'statuses', type: 'system' }, default_statuses)
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
            if(['weapon'].includes(itemtype))
                this._activeEffects({id: parent.id+"_ae", type: parent.type},itemtype)
        }
        _getArmorShield() {
           
            const favorite = { id: 'armorsfavorite', type: 'system' }
            const item_ae = { id: 'armors_ae', type: 'system' }
            const iterable = ['armor', 'shield']
            iterable.forEach(itemType => {
                let items = []
                let items_favorities = []
                let item_cat = { id: itemType, type: 'system' }
                let item_list = this.actor.items.filter(i => i.type === itemType)
                item_list.forEach(el => {
                    let element = {
                        id: el.id,
                        img: el.img,
                        name: el.name,
                        description: el.system.description,
                        encodedValue: [parent.id, el.id, el.id].join(this.delimiter)
                    }
                    if (el.system.favorite == true) {
                        items_favorities.push(element)
                    } else {
                        items.push(element)
                    }
                })
                this.addActions(items, item_cat)
                this.addActions(items_favorities, favorite)
                this._activeEffects(item_ae, itemType)
            })  
        }
        async _getSkills(parent) {
            const tokenType = this.actor.type;

            if(tokenType == "vehicle") {
                const driver = await fromUuid(this.actor.system.driver.id)
                let skill = driver.items.filter(item => item.name === this.actor.system.driver.skill)
                if(skill.length === 0) {
                    skill = driver.items.filter(item=>item.type==="skill" && item.system.die.sides === 4 && item.system.die.modifier === -2)[0]
                } else {
                    skill = skill[0]
                }
                this.addActions([{
                    id: this.actor.id,
                    name: coreModule.api.Utils.i18n("SWADE.ManCheck"),
                    img: "systems/swade/assets/icons/skills/steering-wheel.svg",
                    description: "",
                    encodedValue: ['maneuver', skill.id].join(this.delimiter),
                    info1: { text: SavageActionHandler._buildDieString(skill.system.die) }
                }], parent)

            } else {
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
        }
        _getAttributes(parent) {
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
                cssClass: "disabled",
                description: coreModule.api.Utils.i18n('SWADE.Wounds'),
                encodedValue: ['wounds', 'NONE'].join(this.delimiter),
                info1: { text: String(this.actor.system.wounds.value) +"/"+String(this.actor.system.wounds.max) }
            })

            actions.push({
                id:'WoundsAdd',
                name: "",
                cssClass: "",
                icon1: '<i class="fa fa-plus" aria-hidden="true"></i>',
                description: coreModule.api.Utils.i18n('SWADE.Wounds'),
                encodedValue: ['wounds', 'add'].join(this.delimiter)
            })
            if(this.actor.system.wounds.value > 0) {
                actions.push({
                    id:'WoundsRemove',
                    name: "",
                    cssClass: "",
                    icon1: '<i class="fa fa-minus" aria-hidden="true"></i>',
                    description: coreModule.api.Utils.i18n('SWADE.Wounds'),
                    encodedValue: ['wounds', 'remove'].join(this.delimiter)
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
                cssClass: "disabled",
                description: coreModule.api.Utils.i18n('SWADE.Fatigue'),
                encodedValue: ['fatigue', 'NONE'].join(this.delimiter),
                info1: { text: String(this.actor.system.fatigue.value) +"/"+String(this.actor.system.fatigue.max) }
            })
            actions.push({
                id:'FatigueAdd',
                name: "",
                cssClass: "",
                icon1: '<i class="fa fa-plus" aria-hidden="true"></i>',
                description: coreModule.api.Utils.i18n('SWADE.Fatigue'),
                encodedValue: ['fatigue', 'add'].join(this.delimiter)
            
            })

            if(this.actor.system.fatigue.value > 0) {
                actions.push({
                    id:'FatigueRemove',
                    name: "",
                    cssClass: "",
                    icon1: '<i class="fa fa-minus" aria-hidden="true"></i>',
                    description: coreModule.api.Utils.i18n('SWADE.Fatigue'),
                    encodedValue: ['fatigue', 'remove'].join(this.delimiter)
                
                })
            }
            this.addActions(actions, parent);
        }
        _getStatuses(parent, default_statuses) {
            let actions = [];
            default_statuses.forEach(_status => {
                let img = CONFIG.statusEffects.find((el) => el.id ===_status.toLowerCase())?.icon ?? null;
                
                let action =  {
                    id: _status.toLowerCase(),
                    name: _status,
                    cssClass: this.actor.statuses.has(_status.toLowerCase()) ? "toggle active" : "togle",
                    img: img,
                    description: _status,
                    encodedValue: ['statuses', _status].join(this.delimiter)
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