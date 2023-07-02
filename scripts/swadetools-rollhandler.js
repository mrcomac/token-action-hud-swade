
import {SavageRollHandler} from './core-rollhandler.js'
export let SwadeToolsRollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {

    SwadeToolsRollHandler = class SwadeToolsRollHandler extends SavageRollHandler {
        

        /** @private */
        _rollItem(event, actor, actionId) {
            game.swadetools.item(actor,actionId)
        }

        /** @private */
        async _rollAttribute(event, actor, actionId) {
            await game.swadetools.attribute(actor,actionId)
        }

        /** @private */
        async _rollSkill(event, actor, actionId) {
            await game.swadetools.skill(actor,actionId)
        }

        async _run(event,actor,actionId) {
            await game.swadetools.run(this.actor)
        }

        /** @private */
        async _adjustAttributes(event, actor, macroType, actionId) {
            const actionIdArray = actionId.split(">");
            const changeType = actionIdArray[0];
            const pool = (actionIdArray.length > 0) ? actionIdArray[1] : null;
            let attribute = (macroType === 'powerPoints')
                ? actor.system[macroType][pool]
                : actor.system[macroType];

            if (!attribute) return;

            const curValue = attribute.value;
            const max = attribute.max;
            const min = attribute.min ?? 0;

            let value;
            switch (changeType) {
                case "increase":
                    value = Math.clamped(curValue + 1, min, max);
                    break;
                case "decrease":
                    value = Math.clamped(curValue - 1, min, max);
                    break;
            }

            let update = { data: {} };

            update.data[macroType] = (macroType === 'powerPoints')
                ? { [pool]: { value: value } }
                : { value: value };

            await actor.update(update);
        }

    }
})