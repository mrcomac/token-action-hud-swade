import { ATTRIBUTE_ID, IMG_DICE } from './constants.js'
//export let ActionHandler = null
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
            const macroType = "attributes";
            let actions = []
            Object.entries(this.actor.system.attributes).forEach((a) => {
                const key = a[0];
                const data = a[1];
                let img = IMG_DICE + 'd' + data.die.sides + '.svg'
                let action =  {
                    id:key,
                    name: coreModule.api.Utils.i18n(key),
                    img: img,
                    description: coreModule.api.Utils.i18n('SWADE.Attributes'),
                    encodedValue: [macroType, key].join(this.delimiter),
                    info1: { text: SavageActionHandler._buildDieString(data.die) }
                }
            actions.push(action)
            })
            this.addActions(actions, parent)
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
                this.addActions(actions, {id: 'utilitybenny', type: 'system' });
            }

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
                this.addActions(actions, {id: 'utilitybenny', type: 'system' });

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