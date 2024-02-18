import {SavageRollHandler} from './core-rollhandler.js'
export let SwadeToolsRollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {

    SwadeToolsRollHandler = class SwadeToolsRollHandler extends SavageRollHandler {

        /** @override */
        _rollItem(event, actionId, actor) {
            game.swadetools.item(actor,actionId)
        }

        /** @override */
        async _rollAttribute(event, actionId) {
            await game.swadetools.attribute(this.token.actor,actionId)
        }

        /** @override */
        async _rollSkill(event, actionId, actor) {
            await game.swadetools.skill(actor,actionId)
        }

        /** @override */
        async _run() {
            await game.swadetools.run(this.token.actor)
        }

    }
})