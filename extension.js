/* jshint esnext:true */

const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;


const MAX_RECURSE_DEPTH = 3;

let signalConnections = [];
let dropdowns = [];


/**
 * Try hide a single dropdown actor.
 *
 * Return true on success.
 */
function _apply(actor)
{
    if (actor.text === '\u25BE' || actor.text === '\u25B4' || // regular text drop down arrow (3.10)
       (actor.has_style_class_name && actor.has_style_class_name('popup-menu-arrow'))) // image drop down arrow (3.12)
    {
        actor.hide();

        if (dropdowns.indexOf(actor) < 0)
        {
            let connection = {
                object: actor,
                id: actor.connect('destroy', function() {
                    let index;

                    index = signalConnections.indexOf(connection);
                    if (index >= 0) {
                        signalConnections.splice(index, 1);
                    }

                    index = dropdowns.indexOf(actor);
                    if (index >= 0) {
                        dropdowns.splice(index, 1);
                    }
                })};
            signalConnections.push(connection);
            dropdowns.push(actor);
        }

        return true;
    }

    return false;
}

/**
 * Similar function to _recursiveApply(), but intended for containers.
 */
function _recursiveApplyInternal(actor, depth)
{
    if (typeof actor.get_children !== 'undefined')
    {
        let children = actor.get_children();
        let index, actorAddedId, destroyId, timeoutId;

        // If there are no children then it's possible that actor hasn't been fully initialized yet.
        // Shedule to check later.
        if (children.length == 0)
        {
            actorAddedId = actor.connect('actor-added', function(child) {
                if (_recursiveApply(child)) {
                    actor.disconnect(actorAddedId);
                    actor.disconnect(destroyId);
                    Mainloop.source_remove(timeoutId);

                    actorAddedId = destroyId = timeoutId = 0;
                }
            });
            destroyId = actor.connect('destroy', function() {
                if (timeoutId != 0) {
                    Mainloop.source_remove(timeoutId);
                    timeoutId = 0;
                }
            });
            timeoutId = Mainloop.idle_add(function() {
                    actor.disconnect(actorAddedId);
                    actor.disconnect(destroyId);

                    actorAddedId = destroyId = timeoutId = 0;

                    return GLib.SOURCE_REMOVE;
                });

            return false;
        }

        // Check actor immediate children before using recursion
        for (index = 0; index < children.length; index++)
        {
            if (_apply(children[index])) {
                return true;
            }
        }

        // Check children recursively
        if (depth < MAX_RECURSE_DEPTH)
        {
            for (index = 0; index < children.length; index++)
            {
                if (_recursiveApplyInternal(children[index], depth + 1)) {
                    return true;
                }
            }        
        }
    }

    return false;
}

function _recursiveApply(actor)
{
    return _apply(actor) || _recursiveApplyInternal(actor, 0);
}

function init()
{
	// no initialization required
}

function enable()
{
    Main.panel.actor.get_children().forEach(
        function(actor) {
            signalConnections.push({
                object: actor,
                id: actor.connect('actor-added', _recursiveApply)
            });

            actor.get_children().forEach(_recursiveApply);
        });
}

function disable()
{
    while (signalConnections.length > 0)
    {
        let connection = signalConnections.pop();
        connection.object.disconnect(connection.id);
    }

    while (dropdowns.length > 0)
    {
        let actor = dropdowns.pop();
        actor.show();
    }
}
