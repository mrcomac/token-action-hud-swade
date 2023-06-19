import { ATTRIBUTE_ID, IMG_DICE } from './constants.js'

export let SavageActionHandler = null
export let SavageRollHandler = null
export let SavageSystemManager = null

export let DEFAULTS = null

Hooks.on('tokenActionHudCoreApiReady', async (coreModule) => {

    
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
            ["powers", "weapons", 'consumables', 'gears', 'actions'].forEach( element => {

                this._getItems({ id: element, type: 'system' },element.slice(0, -1))
            })

        }
        _getItems(parent,itemtype) {
            let items = []
            let items_favorities = []

            let item_list = this.actor.items.filter(i => i.type === itemtype)
            item_list.forEach(el => {
                let element = {
                    id: el.id,
                    img: el.img,
                    name: el.name,
                    description: el.system.description,
                    encodedValue: [parent.id,el.id].join(this.delimiter)
                }
                if (["power", "weapon"].includes(el.type) && el.system.damage) {
                    element.info1 = { text: el.system.damage }
                } else if (el.system.die) {
                    element.info1 = { text: SavageActionHandler._buildDieString(el.system.die) }
                } else if(el.type == 'consumable') {
                    element.info1 = {text: el.system.charges.value+"/"+el.system.charges.max }
                }
                if(el.system.favorite == true) {
                    items_favorities.push(element)
                } else {
                    items.push(element)
                }
            })
            this.addActions(items, parent)
            this.addActions(items_favorities, { id: parent.id+'favorite', type: parent.type })
        }
        _getSkills(parent) {

            let skills = this.actor.items.filter(i => i.type === "skill")
            let actions = skills.map(element => {
                return {
                    id: element.id,
                    name: element.name,
                    img: element.img,
                    description: element.system.description,
                    encodedValue: ['skills',element.id].join(this.delimiter),
                    info1: { text: SavageActionHandler._buildDieString(element.system.die) }
                }
                
            });
            this.addActions(actions, parent)
        }
        _getAttributes(parent) {
            // Loading attributes into the list.
            let actions = [ 
                'SWADE.AttrAgi', 
                'SWADE.AttrSma', 
                'SWADE.AttrSpr', 
                'SWADE.AttrStr', 
                'SWADE.AttrVig' ].map( key => {
                    let die = ''
                    switch(key) {
                        case 'SWADE.AttrAgi':
                            die = this.actor.system.attributes.agility.die
                        break
                        case 'SWADE.AttrSma':
                            die = this.actor.system.attributes.smarts.die
                        break
                        case 'SWADE.AttrSpr':
                            die = this.actor.system.attributes.spirit.die
                        break
                        case 'SWADE.AttrStr':
                            die = this.actor.system.attributes.strength.die
                        break
                        case 'SWADE.AttrVig':
                            die = this.actor.system.attributes.vigor.die
                        break
                    }
                    let img = IMG_DICE+'d'+die.sides+'-grey.svg'

                return {
                    id: ATTRIBUTE_ID[key],
                    name: coreModule.api.Utils.i18n(key),
                    img: img,
					description:  coreModule.api.Utils.i18n('SWADE.Attributes'),
                    encodedValue: ['attributes', ATTRIBUTE_ID[key]].join(this.delimiter),
                    info1: { text: SavageActionHandler._buildDieString(die) }
                }
            });

            this.addActions(actions, parent);

        }
        static _buildDieString(die={}) {
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


    /* ROLL HANDLER */

    SavageRollHandler = class SavageRollHandler extends coreModule.api.RollHandler {
        doHandleActionEvent(event, encodedValue) {
            let payload = encodedValue.split("|");
        
            if (payload.length < 2) {
            super.throwInvalidValueErr();
            }
        
            const macroType = payload[0];
            const actionId = payload[1];
            const description = payload[2];

			
			
            if (this.isRenderItem()) {
                this.doRenderItem(this.actor, actionId);
                return;
            }
            let rData = [];    

            switch(macroType) {
                case "attributes":
                    this.actor.rollAttribute(actionId.toLowerCase());
                    break;
                case "skills":
                    this.actor.rollSkill(actionId);
                    break;
                case "powers":
                case "weapons":
                case "consumables":
                case "gears":
                case "actions":
                    let items = this.actor.items.filter(i => i.id === actionId)
                    items[0].show()
            }

            // Ensure the HUD reflects the new conditions
            Hooks.callAll('forceUpdateTokenActionHud');
            return;
        }
		
	
		_chatItem(message) {
			//crates chatmessage
			ChatMessage.create({
				user: game.user._id,
				speaker: ChatMessage.getSpeaker({token: this.actor}),
				content: message
				});
		  }
    }

    // Core Module Imports

    SavageSystemManager = class SavageSystemManager extends coreModule.api.SystemManager {
        /** @override */
        doGetActionHandler () {
            return new SavageActionHandler()
        }

        /** @override */
        getAvailableRollHandlers () {
            const choices = { core: "swade" };
            return choices
        }

        /** @override */
        doGetRollHandler (handlerId) {
            return new SavageRollHandler()
        }

        /** @override */
        /*doRegisterSettings (updateFunc) {
            systemSettings.register(updateFunc)
        }*/

        async doRegisterDefaultFlags () {
            const GROUP = {
                attributes:     { id: 'attributes',             name: coreModule.api.Utils.i18n('SWADE.Attributes'),     type: 'system' },
                skills:         { id: 'skills',                 name: coreModule.api.Utils.i18n('SWADE.Skills'),         type: 'system' },
                powers:         { id: 'powers',                 name: coreModule.api.Utils.i18n('SWADE.Pow'),         type: 'system' },
                powersfav:      { id: 'powersfavorite',         name: coreModule.api.Utils.i18n('SWADE.QuickAccess'),   type: 'system' },
                consumables:    { id: 'consumables',            name: coreModule.api.Utils.i18n('SWADE.Consumable.Consumables'),    type: 'system' },
                consumablesfav: { id: 'consumablesfavorite',    name: coreModule.api.Utils.i18n('SWADE.QuickAccess'),   type: 'system' },
                gears:          { id: 'gears',                  name: coreModule.api.Utils.i18n('TYPES.Item.gear'),          type: 'system' },
                gearsfav:       { id: 'gearsfavorite',          name: coreModule.api.Utils.i18n('SWADE.QuickAccess'),   type: 'system' },
                utility:        { id: 'utility',                name: coreModule.api.Utils.i18n('SWADE.General'),        type: 'system' },
                weapons:        { id: 'weapons',                name: coreModule.api.Utils.i18n('TYPES.Item.weapon'),        type: 'system' },
                weaponsfav:     { id: 'weaponsfavorite',        name: coreModule.api.Utils.i18n('SWADE.QuickAccess'),   type: 'system' },
                actions:        { id: 'actions',                name: coreModule.api.Utils.i18n('TYPES.Item.action'),        type: 'system' },
                actionsfav:     { id: 'actionsfavorite',        name: coreModule.api.Utils.i18n('SWADE.QuickAccess'),   type: 'system' }
            }
            const groups = GROUP
            Object.values(groups).forEach(group => {
                group.name =group.name
                group.listName = `Group: ${group.name}`
            })
            const groupsArray = Object.values(groups)
            DEFAULTS = {
                layout: [
                    {
                        nestId: 'actions',
                        id: 'actions',
                        name: coreModule.api.Utils.i18n('TYPES.Item.action'),
                        groups: [
                            { ...groups.actionsfav, nestId: 'actions_favorities' },
                            { ...groups.actions, nestId: 'actions_utility' }
                        ]
                    },
                    {
                        nestId: 'attributes',
                        id: 'attributes',
                        name: coreModule.api.Utils.i18n('SWADE.Attributes'),
                        groups: [
                            { ...groups.attributes, nestId: 'attributes_abilities' }
                        ]
                    },
                    {
                        nestId: 'skills',
                        id: 'skills',
                        name: coreModule.api.Utils.i18n('SWADE.Skills'),
                        groups: [
                            { ...groups.skills, nestId: 'skills_abilities' }
                        ]
                    },
                    {
                        nestId: 'powers',
                        id: 'powers',
                        name: coreModule.api.Utils.i18n('SWADE.Pow'),
                        groups: [
                            { ...groups.powersfav, nestId: 'powers_favorities' },
                            { ...groups.powers, nestId: 'powers_abilities' }
                        ]
                    },
                    {
                        nestId: 'consumables',
                        id: 'consumables',
                        name: coreModule.api.Utils.i18n('SWADE.Consumable.Consumables'),
                        groups: [
                            { ...groups.consumablesfav, nestId: 'consumables_favorities' },
                            { ...groups.consumables, nestId: 'consumables_gear' }
                        ]
                    },
                    {
                        nestId: 'gears',
                        id: 'gears',
                        name: coreModule.api.Utils.i18n('TYPES.Item.gear'),
                        groups: [
                            { ...groups.gearsfav, nestId: 'gears_favorities' },
                            { ...groups.gears, nestId: 'gears_gear' }
                        ]
                    },
                    {
                        nestId: 'utility',
                        id: 'utility',
                        name: coreModule.api.Utils.i18n('SWADE.General'),
                        groups: [
                            { ...groups.utility, nestId: 'utility_utility' }
                        ]
                    },
                    {
                        nestId: 'weapons',
                        id: 'weapons',
                        name: coreModule.api.Utils.i18n('TYPES.Item.weapon'),
                        groups: [
                            { ...groups.weaponsfav, nestId: 'weapons_favorities' },
                            { ...groups.weapons, nestId: 'weapons_utility' }
                        ]
                    }
                ],
                groups: groupsArray
            }
            return DEFAULTS
        }
    }

    /* STARTING POINT */

    const module = game.modules.get('token-action-hud-swade');
    module.api = {
        requiredCoreModuleVersion: '1.4',
        SystemManager: SavageSystemManager
    }    
     Hooks.call('tokenActionHudSystemReady', module)
});
