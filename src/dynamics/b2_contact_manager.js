/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/
System.register(["../collision/b2_broad_phase.js", "../collision/b2_collision.js", "./b2_contact_factory.js", "./b2_body.js", "./b2_world_callbacks.js"], function (exports_1, context_1) {
    "use strict";
    var b2_broad_phase_js_1, b2_collision_js_1, b2_contact_factory_js_1, b2_body_js_1, b2_world_callbacks_js_1, b2ContactManager;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (b2_broad_phase_js_1_1) {
                b2_broad_phase_js_1 = b2_broad_phase_js_1_1;
            },
            function (b2_collision_js_1_1) {
                b2_collision_js_1 = b2_collision_js_1_1;
            },
            function (b2_contact_factory_js_1_1) {
                b2_contact_factory_js_1 = b2_contact_factory_js_1_1;
            },
            function (b2_body_js_1_1) {
                b2_body_js_1 = b2_body_js_1_1;
            },
            function (b2_world_callbacks_js_1_1) {
                b2_world_callbacks_js_1 = b2_world_callbacks_js_1_1;
            }
        ],
        execute: function () {
            // Delegate of b2World.
            b2ContactManager = class b2ContactManager {
                constructor() {
                    this.m_broadPhase = new b2_broad_phase_js_1.b2BroadPhase();
                    this.m_contactList = null;
                    this.m_contactCount = 0;
                    this.m_contactFilter = b2_world_callbacks_js_1.b2ContactFilter.b2_defaultFilter;
                    this.m_contactListener = b2_world_callbacks_js_1.b2ContactListener.b2_defaultListener;
                    this.m_contactFactory = new b2_contact_factory_js_1.b2ContactFactory();
                }
                // Broad-phase callback.
                AddPair(proxyA, proxyB) {
                    // DEBUG: b2Assert(proxyA instanceof b2FixtureProxy);
                    // DEBUG: b2Assert(proxyB instanceof b2FixtureProxy);
                    let fixtureA = proxyA.fixture;
                    let fixtureB = proxyB.fixture;
                    let indexA = proxyA.childIndex;
                    let indexB = proxyB.childIndex;
                    let bodyA = fixtureA.GetBody();
                    let bodyB = fixtureB.GetBody();
                    // Are the fixtures on the same body?
                    if (bodyA === bodyB) {
                        return;
                    }
                    // TODO_ERIN use a hash table to remove a potential bottleneck when both
                    // bodies have a lot of contacts.
                    // Does a contact already exist?
                    let edge = bodyB.GetContactList();
                    while (edge) {
                        if (edge.other === bodyA) {
                            const fA = edge.contact.GetFixtureA();
                            const fB = edge.contact.GetFixtureB();
                            const iA = edge.contact.GetChildIndexA();
                            const iB = edge.contact.GetChildIndexB();
                            if (fA === fixtureA && fB === fixtureB && iA === indexA && iB === indexB) {
                                // A contact already exists.
                                return;
                            }
                            if (fA === fixtureB && fB === fixtureA && iA === indexB && iB === indexA) {
                                // A contact already exists.
                                return;
                            }
                        }
                        edge = edge.next;
                    }
                    // Check user filtering.
                    if (this.m_contactFilter && !this.m_contactFilter.ShouldCollide(fixtureA, fixtureB)) {
                        return;
                    }
                    // Call the factory.
                    const c = this.m_contactFactory.Create(fixtureA, indexA, fixtureB, indexB);
                    if (c === null) {
                        return;
                    }
                    // Contact creation may swap fixtures.
                    fixtureA = c.GetFixtureA();
                    fixtureB = c.GetFixtureB();
                    indexA = c.GetChildIndexA();
                    indexB = c.GetChildIndexB();
                    bodyA = fixtureA.m_body;
                    bodyB = fixtureB.m_body;
                    // Insert into the world.
                    c.m_prev = null;
                    c.m_next = this.m_contactList;
                    if (this.m_contactList !== null) {
                        this.m_contactList.m_prev = c;
                    }
                    this.m_contactList = c;
                    // Connect to island graph.
                    // Connect to body A
                    c.m_nodeA.other = bodyB;
                    c.m_nodeA.prev = null;
                    c.m_nodeA.next = bodyA.m_contactList;
                    if (bodyA.m_contactList !== null) {
                        bodyA.m_contactList.prev = c.m_nodeA;
                    }
                    bodyA.m_contactList = c.m_nodeA;
                    // Connect to body B
                    c.m_nodeB.other = bodyA;
                    c.m_nodeB.prev = null;
                    c.m_nodeB.next = bodyB.m_contactList;
                    if (bodyB.m_contactList !== null) {
                        bodyB.m_contactList.prev = c.m_nodeB;
                    }
                    bodyB.m_contactList = c.m_nodeB;
                    ++this.m_contactCount;
                }
                FindNewContacts() {
                    this.m_broadPhase.UpdatePairs((proxyA, proxyB) => {
                        this.AddPair(proxyA, proxyB);
                    });
                }
                Destroy(c) {
                    const fixtureA = c.GetFixtureA();
                    const fixtureB = c.GetFixtureB();
                    const bodyA = fixtureA.GetBody();
                    const bodyB = fixtureB.GetBody();
                    if (this.m_contactListener && c.IsTouching()) {
                        this.m_contactListener.EndContact(c);
                    }
                    // Remove from the world.
                    if (c.m_prev) {
                        c.m_prev.m_next = c.m_next;
                    }
                    if (c.m_next) {
                        c.m_next.m_prev = c.m_prev;
                    }
                    if (c === this.m_contactList) {
                        this.m_contactList = c.m_next;
                    }
                    // Remove from body 1
                    if (c.m_nodeA.prev) {
                        c.m_nodeA.prev.next = c.m_nodeA.next;
                    }
                    if (c.m_nodeA.next) {
                        c.m_nodeA.next.prev = c.m_nodeA.prev;
                    }
                    if (c.m_nodeA === bodyA.m_contactList) {
                        bodyA.m_contactList = c.m_nodeA.next;
                    }
                    // Remove from body 2
                    if (c.m_nodeB.prev) {
                        c.m_nodeB.prev.next = c.m_nodeB.next;
                    }
                    if (c.m_nodeB.next) {
                        c.m_nodeB.next.prev = c.m_nodeB.prev;
                    }
                    if (c.m_nodeB === bodyB.m_contactList) {
                        bodyB.m_contactList = c.m_nodeB.next;
                    }
                    // moved this from b2ContactFactory:Destroy
                    if (c.m_manifold.pointCount > 0 &&
                        !fixtureA.IsSensor() &&
                        !fixtureB.IsSensor()) {
                        fixtureA.GetBody().SetAwake(true);
                        fixtureB.GetBody().SetAwake(true);
                    }
                    // Call the factory.
                    this.m_contactFactory.Destroy(c);
                    --this.m_contactCount;
                }
                // This is the top level collision call for the time step. Here
                // all the narrow phase collision is processed for the world
                // contact list.
                Collide() {
                    // Update awake contacts.
                    let c = this.m_contactList;
                    while (c) {
                        const fixtureA = c.GetFixtureA();
                        const fixtureB = c.GetFixtureB();
                        const indexA = c.GetChildIndexA();
                        const indexB = c.GetChildIndexB();
                        const bodyA = fixtureA.GetBody();
                        const bodyB = fixtureB.GetBody();
                        // Is this contact flagged for filtering?
                        if (c.m_filterFlag) {
                            // Check user filtering.
                            if (this.m_contactFilter && !this.m_contactFilter.ShouldCollide(fixtureA, fixtureB)) {
                                const cNuke = c;
                                c = cNuke.m_next;
                                this.Destroy(cNuke);
                                continue;
                            }
                            // Clear the filtering flag.
                            c.m_filterFlag = false;
                        }
                        const activeA = bodyA.IsAwake() && bodyA.m_type !== b2_body_js_1.b2BodyType.b2_staticBody;
                        const activeB = bodyB.IsAwake() && bodyB.m_type !== b2_body_js_1.b2BodyType.b2_staticBody;
                        // At least one body must be awake and it must be dynamic or kinematic.
                        if (!activeA && !activeB) {
                            c = c.m_next;
                            continue;
                        }
                        const treeNodeA = fixtureA.m_proxies[indexA].treeNode;
                        const treeNodeB = fixtureB.m_proxies[indexB].treeNode;
                        const overlap = b2_collision_js_1.b2TestOverlapAABB(treeNodeA.aabb, treeNodeB.aabb);
                        // Here we destroy contacts that cease to overlap in the broad-phase.
                        if (!overlap) {
                            const cNuke = c;
                            c = cNuke.m_next;
                            this.Destroy(cNuke);
                            continue;
                        }
                        // The contact persists.
                        c.Update(this.m_contactListener);
                        c = c.m_next;
                    }
                }
            };
            exports_1("b2ContactManager", b2ContactManager);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYjJfY29udGFjdF9tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYjJfY29udGFjdF9tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0VBZ0JFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFZRix1QkFBdUI7WUFDdkIsbUJBQUEsTUFBYSxnQkFBZ0I7Z0JBQTdCO29CQUNrQixpQkFBWSxHQUFpQyxJQUFJLGdDQUFZLEVBQWtCLENBQUM7b0JBQ3pGLGtCQUFhLEdBQXFCLElBQUksQ0FBQztvQkFDdkMsbUJBQWMsR0FBVyxDQUFDLENBQUM7b0JBQzNCLG9CQUFlLEdBQW9CLHVDQUFlLENBQUMsZ0JBQWdCLENBQUM7b0JBQ3BFLHNCQUFpQixHQUFzQix5Q0FBaUIsQ0FBQyxrQkFBa0IsQ0FBQztvQkFFbkUscUJBQWdCLEdBQXFCLElBQUksd0NBQWdCLEVBQUUsQ0FBQztnQkE0TjlFLENBQUM7Z0JBMU5DLHdCQUF3QjtnQkFDakIsT0FBTyxDQUFDLE1BQXNCLEVBQUUsTUFBc0I7b0JBQzNELHFEQUFxRDtvQkFDckQscURBQXFEO29CQUVyRCxJQUFJLFFBQVEsR0FBYyxNQUFNLENBQUMsT0FBTyxDQUFDO29CQUN6QyxJQUFJLFFBQVEsR0FBYyxNQUFNLENBQUMsT0FBTyxDQUFDO29CQUV6QyxJQUFJLE1BQU0sR0FBVyxNQUFNLENBQUMsVUFBVSxDQUFDO29CQUN2QyxJQUFJLE1BQU0sR0FBVyxNQUFNLENBQUMsVUFBVSxDQUFDO29CQUV2QyxJQUFJLEtBQUssR0FBVyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3ZDLElBQUksS0FBSyxHQUFXLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFFdkMscUNBQXFDO29CQUNyQyxJQUFJLEtBQUssS0FBSyxLQUFLLEVBQUU7d0JBQ25CLE9BQU87cUJBQ1I7b0JBRUQsd0VBQXdFO29CQUN4RSxpQ0FBaUM7b0JBQ2pDLGdDQUFnQztvQkFDaEMs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