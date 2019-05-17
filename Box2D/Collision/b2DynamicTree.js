/*
* Copyright (c) 2009 Erin Catto http://www.box2d.org
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
System.register(["../Common/b2Settings", "../Common/b2Math", "../Common/b2GrowableStack", "./b2Collision"], function (exports_1, context_1) {
    "use strict";
    var b2Settings_1, b2Math_1, b2GrowableStack_1, b2Collision_1, b2TreeNode, b2DynamicTree;
    var __moduleName = context_1 && context_1.id;
    function verify(value) {
        if (value === null) {
            throw new Error();
        }
        return value;
    }
    return {
        setters: [
            function (b2Settings_1_1) {
                b2Settings_1 = b2Settings_1_1;
            },
            function (b2Math_1_1) {
                b2Math_1 = b2Math_1_1;
            },
            function (b2GrowableStack_1_1) {
                b2GrowableStack_1 = b2GrowableStack_1_1;
            },
            function (b2Collision_1_1) {
                b2Collision_1 = b2Collision_1_1;
            }
        ],
        execute: function () {
            /// A node in the dynamic tree. The client does not interact with this directly.
            b2TreeNode = class b2TreeNode {
                constructor(id = 0) {
                    this.m_id = 0;
                    this.aabb = new b2Collision_1.b2AABB();
                    this._userData = null;
                    this.parent = null; // or next
                    this.child1 = null;
                    this.child2 = null;
                    this.height = 0; // leaf = 0, free node = -1
                    this.m_id = id;
                }
                get userData() {
                    if (this._userData === null) {
                        throw new Error();
                    }
                    return this._userData;
                }
                set userData(value) {
                    if (this._userData !== null) {
                        throw new Error();
                    }
                    this._userData = value;
                }
                Reset() {
                    this._userData = null;
                }
                IsLeaf() {
                    return this.child1 === null;
                }
            };
            exports_1("b2TreeNode", b2TreeNode);
            b2DynamicTree = class b2DynamicTree {
                constructor() {
                    this.m_root = null;
                    // b2TreeNode* public m_nodes;
                    // int32 public m_nodeCount;
                    // int32 public m_nodeCapacity;
                    this.m_freeList = null;
                    this.m_path = 0;
                    this.m_insertionCount = 0;
                    this.m_stack = new b2GrowableStack_1.b2GrowableStack(256);
                }
                // public GetUserData(proxy: b2TreeNode<T>): T {
                //   // DEBUG: b2Assert(proxy !== null);
                //   return proxy.userData;
                // }
                // public GetFatAABB(proxy: b2TreeNode<T>): b2AABB {
                //   // DEBUG: b2Assert(proxy !== null);
                //   return proxy.aabb;
                // }
                Query(aabb, callback) {
                    if (this.m_root === null) {
                        return;
                    }
                    const stack = this.m_stack.Reset();
                    stack.Push(this.m_root);
                    while (stack.GetCount() > 0) {
                        const node = stack.Pop();
                        // if (node === null) {
                        //   continue;
                        // }
                        if (node.aabb.TestOverlap(aabb)) {
                            if (node.IsLeaf()) {
                                const proceed = callback(node);
                                if (!proceed) {
                                    return;
                                }
                            }
                            else {
                                stack.Push(verify(node.child1));
                                stack.Push(verify(node.child2));
                            }
                        }
                    }
                }
                QueryPoint(point, callback) {
                    if (this.m_root === null) {
                        return;
                    }
                    const stack = this.m_stack.Reset();
                    stack.Push(this.m_root);
                    while (stack.GetCount() > 0) {
                        const node = stack.Pop();
                        // if (node === null) {
                        //   continue;
                        // }
                        if (node.aabb.TestContain(point)) {
                            if (node.IsLeaf()) {
                                const proceed = callback(node);
                                if (!proceed) {
                                    return;
                                }
                            }
                            else {
                                stack.Push(verify(node.child1));
                                stack.Push(verify(node.child2));
                            }
                        }
                    }
                }
                RayCast(input, callback) {
                    if (this.m_root === null) {
                        return;
                    }
                    const p1 = input.p1;
                    const p2 = input.p2;
                    const r = b2Math_1.b2Vec2.SubVV(p2, p1, b2DynamicTree.s_r);
                    // DEBUG: b2Assert(r.LengthSquared() > 0);
                    r.Normalize();
                    // v is perpendicular to the segment.
                    const v = b2Math_1.b2Vec2.CrossOneV(r, b2DynamicTree.s_v);
                    const abs_v = b2Math_1.b2Vec2.AbsV(v, b2DynamicTree.s_abs_v);
                    // Separating axis for segment (Gino, p80).
                    // |dot(v, p1 - c)| > dot(|v|, h)
                    let maxFraction = input.maxFraction;
                    // Build a bounding box for the segment.
                    const segmentAABB = b2DynamicTree.s_segmentAABB;
                    let t_x = p1.x + maxFraction * (p2.x - p1.x);
                    let t_y = p1.y + maxFraction * (p2.y - p1.y);
                    segmentAABB.lowerBound.x = b2Math_1.b2Min(p1.x, t_x);
                    segmentAABB.lowerBound.y = b2Math_1.b2Min(p1.y, t_y);
                    segmentAABB.upperBound.x = b2Math_1.b2Max(p1.x, t_x);
                    segmentAABB.upperBound.y = b2Math_1.b2Max(p1.y, t_y);
                    const stack = this.m_stack.Reset();
                    stack.Push(this.m_root);
                    while (stack.GetCount() > 0) {
                        const node = stack.Pop();
                        // if (node === null) {
                        //   continue;
                        // }
                        if (!b2Collision_1.b2TestOverlapAABB(node.aabb, segmentAABB)) {
                            continue;
                        }
                        // Separating axis for segment (Gino, p80).
                        // |dot(v, p1 - c)| > dot(|v|, h)
                        const c = node.aabb.GetCenter();
                        const h = node.aabb.GetExtents();
                        const separation = b2Math_1.b2Abs(b2Math_1.b2Vec2.DotVV(v, b2Math_1.b2Vec2.SubVV(p1, c, b2Math_1.b2Vec2.s_t0))) - b2Math_1.b2Vec2.DotVV(abs_v, h);
                        if (separation > 0) {
                            continue;
                        }
                        if (node.IsLeaf()) {
                            const subInput = b2DynamicTree.s_subInput;
                            subInput.p1.Copy(input.p1);
                            subInput.p2.Copy(input.p2);
                            subInput.maxFraction = maxFraction;
                            const value = callback(subInput, node);
                            if (value === 0) {
                                // The client has terminated the ray cast.
                                return;
                            }
                            if (value > 0) {
                                // Update segment bounding box.
                                maxFraction = value;
                                t_x = p1.x + maxFraction * (p2.x - p1.x);
                                t_y = p1.y + maxFraction * (p2.y - p1.y);
                                segmentAABB.lowerBound.x = b2Math_1.b2Min(p1.x, t_x);
                                segmentAABB.lowerBound.y = b2Math_1.b2Min(p1.y, t_y);
                                segmentAABB.upperBound.x = b2Math_1.b2Max(p1.x, t_x);
                                segmentAABB.upperBound.y = b2Math_1.b2Max(p1.y, t_y);
                            }
                        }
                        else {
                            stack.Push(verify(node.child1));
                            stack.Push(verify(node.child2));
                        }
                    }
                }
                AllocateNode() {
                    // Expand the node pool as needed.
                    if (this.m_freeList) {
                        const node = this.m_freeList;
                        this.m_freeList = node.parent; // this.m_freeList = node.next;
                        node.parent = null;
                        node.child1 = null;
                        node.child2 = null;
                        node.height = 0;
                        node.Reset();
                        return node;
                    }
                    return new b2TreeNode(b2DynamicTree.s_node_id++);
                }
                FreeNode(node) {
                    node.parent = this.m_freeList; // node.next = this.m_freeList;
                    node.child1 = null;
                    node.child2 = null;
                    node.height = -1;
                    node.Reset();
                    this.m_freeList = node;
                }
                CreateProxy(aabb, userData) {
                    const node = this.AllocateNode();
                    // Fatten the aabb.
                    const r_x = b2Settings_1.b2_aabbExtension;
                    const r_y = b2Settings_1.b2_aabbExtension;
                    node.aabb.lowerBound.x = aabb.lowerBound.x - r_x;
                    node.aabb.lowerBound.y = aabb.lowerBound.y - r_y;
                    node.aabb.upperBound.x = aabb.upperBound.x + r_x;
                    node.aabb.upperBound.y = aabb.upperBound.y + r_y;
                    node.userData = userData;
                    node.height = 0;
                    this.InsertLeaf(node);
                    return node;
                }
                DestroyProxy(proxy) {
                    // DEBUG: b2Assert(proxy.IsLeaf());
                    this.RemoveLeaf(proxy);
                    this.FreeNode(proxy);
                }
                MoveProxy(proxy, aabb, displacement) {
                    // DEBUG: b2Assert(proxy.IsLeaf());
                    if (proxy.aabb.Contains(aabb)) {
                        return false;
                    }
                    this.RemoveLeaf(proxy);
                    // Extend AABB.
                    // Predict AABB displacement.
                    const r_x = b2Settings_1.b2_aabbExtension + b2Settings_1.b2_aabbMultiplier * (displacement.x > 0 ? displacement.x : (-displacement.x));
                    const r_y = b2Settings_1.b2_aabbExtension + b2Settings_1.b2_aabbMultiplier * (displacement.y > 0 ? displacement.y : (-displacement.y));
                    proxy.aabb.lowerBound.x = aabb.lowerBound.x - r_x;
                    proxy.aabb.lowerBound.y = aabb.lowerBound.y - r_y;
                    proxy.aabb.upperBound.x = aabb.upperBound.x + r_x;
                    proxy.aabb.upperBound.y = aabb.upperBound.y + r_y;
                    this.InsertLeaf(proxy);
                    return true;
                }
                InsertLeaf(leaf) {
                    ++this.m_insertionCount;
                    if (this.m_root === null) {
                        this.m_root = leaf;
                        this.m_root.parent = null;
                        return;
                    }
                    // Find the best sibling for this node
                    const leafAABB = leaf.aabb;
                    ///const center: b2Vec2 = leafAABB.GetCenter();
                    let index = this.m_root;
                    while (!index.IsLeaf()) {
                        const child1 = verify(index.child1);
                        const child2 = verify(index.child2);
                        const area = index.aabb.GetPerimeter();
                        const combinedAABB = b2DynamicTree.s_combinedAABB;
                        combinedAABB.Combine2(index.aabb, leafAABB);
                        const combinedArea = combinedAABB.GetPerimeter();
                        // Cost of creating a new parent for this node and the new leaf
                        const cost = 2 * combinedArea;
                        // Minimum cost of pushing the leaf further down the tree
                        const inheritanceCost = 2 * (combinedArea - area);
                        // Cost of descending into child1
                        let cost1;
                        const aabb = b2DynamicTree.s_aabb;
                        let oldArea;
                        let newArea;
                        if (child1.IsLeaf()) {
                            aabb.Combine2(leafAABB, child1.aabb);
                            cost1 = aabb.GetPerimeter() + inheritanceCost;
                        }
                        else {
                            aabb.Combine2(leafAABB, child1.aabb);
                            oldArea = child1.aabb.GetPerimeter();
                            newArea = aabb.GetPerimeter();
                            cost1 = (newArea - oldArea) + inheritanceCost;
                        }
                        // Cost of descending into child2
                        let cost2;
                        if (child2.IsLeaf()) {
                            aabb.Combine2(leafAABB, child2.aabb);
                            cost2 = aabb.GetPerimeter() + inheritanceCost;
                        }
                        else {
                            aabb.Combine2(leafAABB, child2.aabb);
                            oldArea = child2.aabb.GetPerimeter();
                            newArea = aabb.GetPerimeter();
                            cost2 = newArea - oldArea + inheritanceCost;
                        }
                        // Descend according to the minimum cost.
                        if (cost < cost1 && cost < cost2) {
                            break;
                        }
                        // Descend
                        if (cost1 < cost2) {
                            index = child1;
                        }
                        else {
                            index = child2;
                        }
                    }
                    const sibling = index;
                    // Create a parent for the siblings.
                    const oldParent = sibling.parent;
                    const newParent = this.AllocateNode();
                    newParent.parent = oldParent;
                    newParent.aabb.Combine2(leafAABB, sibling.aabb);
                    newParent.height = sibling.height + 1;
                    if (oldParent) {
                        // The sibling was not the root.
                        if (oldParent.child1 === sibling) {
                            oldParent.child1 = newParent;
                        }
                        else {
                            oldParent.child2 = newParent;
                        }
                        newParent.child1 = sibling;
                        newParent.child2 = leaf;
                        sibling.parent = newParent;
                        leaf.parent = newParent;
                    }
                    else {
                        // The sibling was the root.
                        newParent.child1 = sibling;
                        newParent.child2 = leaf;
                        sibling.parent = newParent;
                        leaf.parent = newParent;
                        this.m_root = newParent;
                    }
                    // Walk back up the tree fixing heights and AABBs
                    let index2 = leaf.parent;
                    while (index2 !== null) {
                        index2 = this.Balance(index2);
                        const child1 = verify(index2.child1);
                        const child2 = verify(index2.child2);
                        index2.height = 1 + b2Math_1.b2Max(child1.height, child2.height);
                        index2.aabb.Combine2(child1.aabb, child2.aabb);
                        index2 = index2.parent;
                    }
                    // this.Validate();
                }
                RemoveLeaf(leaf) {
                    if (leaf === this.m_root) {
                        this.m_root = null;
                        return;
                    }
                    const parent = verify(leaf.parent);
                    const grandParent = parent && parent.parent;
                    let sibling;
                    if (parent.child1 === leaf) {
                        sibling = verify(parent.child2);
                    }
                    else {
                        sibling = verify(parent.child1);
                    }
                    if (grandParent) {
                        // Destroy parent and connect sibling to grandParent.
                        if (grandParent.child1 === parent) {
                            grandParent.child1 = sibling;
                        }
                        else {
                            grandParent.child2 = sibling;
                        }
                        sibling.parent = grandParent;
                        this.FreeNode(parent);
                        // Adjust ancestor bounds.
                        let index = grandParent;
                        while (index) {
                            index = this.Balance(index);
                            const child1 = verify(index.child1);
                            const child2 = verify(index.child2);
                            index.aabb.Combine2(child1.aabb, child2.aabb);
                            index.height = 1 + b2Math_1.b2Max(child1.height, child2.height);
                            index = index.parent;
                        }
                    }
                    else {
                        this.m_root = sibling;
                        sibling.parent = null;
                        this.FreeNode(parent);
                    }
                    // this.Validate();
                }
                Balance(A) {
                    // DEBUG: b2Assert(A !== null);
                    if (A.IsLeaf() || A.height < 2) {
                        return A;
                    }
                    const B = verify(A.child1);
                    const C = verify(A.child2);
                    const balance = C.height - B.height;
                    // Rotate C up
                    if (balance > 1) {
                        const F = verify(C.child1);
                        const G = verify(C.child2);
                        // Swap A and C
                        C.child1 = A;
                        C.parent = A.parent;
                        A.parent = C;
                        // A's old parent should point to C
                        if (C.parent !== null) {
                            if (C.parent.child1 === A) {
                                C.parent.child1 = C;
                            }
                            else {
                                // DEBUG: b2Assert(C.parent.child2 === A);
                                C.parent.child2 = C;
                            }
                        }
                        else {
                            this.m_root = C;
                        }
                        // Rotate
                        if (F.height > G.height) {
                            C.child2 = F;
                            A.child2 = G;
                            G.parent = A;
                            A.aabb.Combine2(B.aabb, G.aabb);
                            C.aabb.Combine2(A.aabb, F.aabb);
                            A.height = 1 + b2Math_1.b2Max(B.height, G.height);
                            C.height = 1 + b2Math_1.b2Max(A.height, F.height);
                        }
                        else {
                            C.child2 = G;
                            A.child2 = F;
                            F.parent = A;
                            A.aabb.Combine2(B.aabb, F.aabb);
                            C.aabb.Combine2(A.aabb, G.aabb);
                            A.height = 1 + b2Math_1.b2Max(B.height, F.height);
                            C.height = 1 + b2Math_1.b2Max(A.height, G.height);
                        }
                        return C;
                    }
                    // Rotate B up
                    if (balance < -1) {
                        const D = verify(B.child1);
                        const E = verify(B.child2);
                        // Swap A and B
                        B.child1 = A;
                        B.parent = A.parent;
                        A.parent = B;
                        // A's old parent should point to B
                        if (B.parent !== null) {
                            if (B.parent.child1 === A) {
                                B.parent.child1 = B;
                            }
                            else {
                                // DEBUG: b2Assert(B.parent.child2 === A);
                                B.parent.child2 = B;
                            }
                        }
                        else {
                            this.m_root = B;
                        }
                        // Rotate
                        if (D.height > E.height) {
                            B.child2 = D;
                            A.child1 = E;
                            E.parent = A;
                            A.aabb.Combine2(C.aabb, E.aabb);
                            B.aabb.Combine2(A.aabb, D.aabb);
                            A.height = 1 + b2Math_1.b2Max(C.height, E.height);
                            B.height = 1 + b2Math_1.b2Max(A.height, D.height);
                        }
                        else {
                            B.child2 = E;
                            A.child1 = D;
                            D.parent = A;
                            A.aabb.Combine2(C.aabb, D.aabb);
                            B.aabb.Combine2(A.aabb, E.aabb);
                            A.height = 1 + b2Math_1.b2Max(C.height, D.height);
                            B.height = 1 + b2Math_1.b2Max(A.height, E.height);
                        }
                        return B;
                    }
                    return A;
                }
                GetHeight() {
                    if (this.m_root === null) {
                        return 0;
                    }
                    return this.m_root.height;
                }
                static GetAreaNode(node) {
                    if (node === null) {
                        return 0;
                    }
                    if (node.IsLeaf()) {
                        return 0;
                    }
                    let area = node.aabb.GetPerimeter();
                    area += b2DynamicTree.GetAreaNode(node.child1);
                    area += b2DynamicTree.GetAreaNode(node.child2);
                    return area;
                }
                GetAreaRatio() {
                    if (this.m_root === null) {
                        return 0;
                    }
                    const root = this.m_root;
                    const rootArea = root.aabb.GetPerimeter();
                    const totalArea = b2DynamicTree.GetAreaNode(this.m_root);
                    /*
                    float32 totalArea = 0.0;
                    for (int32 i = 0; i < m_nodeCapacity; ++i) {
                      const b2TreeNode<T>* node = m_nodes + i;
                      if (node.height < 0) {
                        // Free node in pool
                        continue;
                      }
                
                      totalArea += node.aabb.GetPerimeter();
                    }
                    */
                    return totalArea / rootArea;
                }
                ComputeHeightNode(node) {
                    if (!node || node.IsLeaf()) {
                        return 0;
                    }
                    const height1 = this.ComputeHeightNode(node.child1);
                    const height2 = this.ComputeHeightNode(node.child2);
                    return 1 + b2Math_1.b2Max(height1, height2);
                }
                ComputeHeight() {
                    const height = this.ComputeHeightNode(this.m_root);
                    return height;
                }
                ValidateStructure(index) {
                    if (index === null) {
                        return;
                    }
                    if (index === this.m_root) {
                        // DEBUG: b2Assert(index.parent === null);
                    }
                    const node = index;
                    if (node.IsLeaf()) {
                        // DEBUG: b2Assert(node.child1 === null);
                        // DEBUG: b2Assert(node.child2 === null);
                        // DEBUG: b2Assert(node.height === 0);
                        return;
                    }
                    const child1 = verify(node.child1);
                    const child2 = verify(node.child2);
                    // DEBUG: b2Assert(child1.parent === index);
                    // DEBUG: b2Assert(child2.parent === index);
                    this.ValidateStructure(child1);
                    this.ValidateStructure(child2);
                }
                ValidateMetrics(index) {
                    if (index === null) {
                        return;
                    }
                    const node = index;
                    if (node.IsLeaf()) {
                        // DEBUG: b2Assert(node.child1 === null);
                        // DEBUG: b2Assert(node.child2 === null);
                        // DEBUG: b2Assert(node.height === 0);
                        return;
                    }
                    const child1 = verify(node.child1);
                    const child2 = verify(node.child2);
                    // DEBUG: const height1: number = child1.height;
                    // DEBUG: const height2: number = child2.height;
                    // DEBUG: const height: number = 1 + b2Max(height1, height2);
                    // DEBUG: b2Assert(node.height === height);
                    const aabb = b2DynamicTree.s_aabb;
                    aabb.Combine2(child1.aabb, child2.aabb);
                    // DEBUG: b2Assert(aabb.lowerBound === node.aabb.lowerBound);
                    // DEBUG: b2Assert(aabb.upperBound === node.aabb.upperBound);
                    this.ValidateMetrics(child1);
                    this.ValidateMetrics(child2);
                }
                Validate() {
                    // DEBUG: this.ValidateStructure(this.m_root);
                    // DEBUG: this.ValidateMetrics(this.m_root);
                    // let freeCount: number = 0;
                    // let freeIndex: b2TreeNode<T> | null = this.m_freeList;
                    // while (freeIndex !== null) {
                    //   freeIndex = freeIndex.parent; // freeIndex = freeIndex.next;
                    //   ++freeCount;
                    // }
                    // DEBUG: b2Assert(this.GetHeight() === this.ComputeHeight());
                    // b2Assert(this.m_nodeCount + freeCount === this.m_nodeCapacity);
                }
                static GetMaxBalanceNode(node, maxBalance) {
                    if (node === null) {
                        return maxBalance;
                    }
                    if (node.height <= 1) {
                        return maxBalance;
                    }
                    // DEBUG: b2Assert(!node.IsLeaf());
                    const child1 = verify(node.child1);
                    const child2 = verify(node.child2);
                    const balance = b2Math_1.b2Abs(child2.height - child1.height);
                    return b2Math_1.b2Max(maxBalance, balance);
                }
                GetMaxBalance() {
                    const maxBalance = b2DynamicTree.GetMaxBalanceNode(this.m_root, 0);
                    /*
                    int32 maxBalance = 0;
                    for (int32 i = 0; i < m_nodeCapacity; ++i) {
                      const b2TreeNode<T>* node = m_nodes + i;
                      if (node.height <= 1) {
                        continue;
                      }
                
                      b2Assert(!node.IsLeaf());
                
                      int32 child1 = node.child1;
                      int32 child2 = node.child2;
                      int32 balance = b2Abs(m_nodes[child2].height - m_nodes[child1].height);
                      maxBalance = b2Max(maxBalance, balance);
                    }
                    */
                    return maxBalance;
                }
                RebuildBottomUp() {
                    /*
                    int32* nodes = (int32*)b2Alloc(m_nodeCount * sizeof(int32));
                    int32 count = 0;
                
                    // Build array of leaves. Free the rest.
                    for (int32 i = 0; i < m_nodeCapacity; ++i) {
                      if (m_nodes[i].height < 0) {
                        // free node in pool
                        continue;
                      }
                
                      if (m_nodes[i].IsLeaf()) {
                        m_nodes[i].parent = b2_nullNode;
                        nodes[count] = i;
                        ++count;
                      } else {
                        FreeNode(i);
                      }
                    }
                
                    while (count > 1) {
                      float32 minCost = b2_maxFloat;
                      int32 iMin = -1, jMin = -1;
                      for (int32 i = 0; i < count; ++i) {
                        b2AABB aabbi = m_nodes[nodes[i]].aabb;
                
                        for (int32 j = i + 1; j < count; ++j) {
                          b2AABB aabbj = m_nodes[nodes[j]].aabb;
                          b2AABB b;
                          b.Combine(aabbi, aabbj);
                          float32 cost = b.GetPerimeter();
                          if (cost < minCost) {
                            iMin = i;
                            jMin = j;
                            minCost = cost;
                          }
                        }
                      }
                
                      int32 index1 = nodes[iMin];
                      int32 index2 = nodes[jMin];
                      b2TreeNode<T>* child1 = m_nodes + index1;
                      b2TreeNode<T>* child2 = m_nodes + index2;
                
                      int32 parentIndex = AllocateNode();
                      b2TreeNode<T>* parent = m_nodes + parentIndex;
                      parent.child1 = index1;
                      parent.child2 = index2;
                      parent.height = 1 + b2Max(child1.height, child2.height);
                      parent.aabb.Combine(child1.aabb, child2.aabb);
                      parent.parent = b2_nullNode;
                
                      child1.parent = parentIndex;
                      child2.parent = parentIndex;
                
                      nodes[jMin] = nodes[count-1];
                      nodes[iMin] = parentIndex;
                      --count;
                    }
                
                    m_root = nodes[0];
                    b2Free(nodes);
                    */
                    this.Validate();
                }
                static ShiftOriginNode(node, newOrigin) {
                    if (node === null) {
                        return;
                    }
                    if (node.height <= 1) {
                        return;
                    }
                    // DEBUG: b2Assert(!node.IsLeaf());
                    const child1 = node.child1;
                    const child2 = node.child2;
                    b2DynamicTree.ShiftOriginNode(child1, newOrigin);
                    b2DynamicTree.ShiftOriginNode(child2, newOrigin);
                    node.aabb.lowerBound.SelfSub(newOrigin);
                    node.aabb.upperBound.SelfSub(newOrigin);
                }
                ShiftOrigin(newOrigin) {
                    b2DynamicTree.ShiftOriginNode(this.m_root, newOrigin);
                    /*
                    // Build array of leaves. Free the rest.
                    for (int32 i = 0; i < m_nodeCapacity; ++i) {
                      m_nodes[i].aabb.lowerBound -= newOrigin;
                      m_nodes[i].aabb.upperBound -= newOrigin;
                    }
                    */
                }
            };
            b2DynamicTree.s_r = new b2Math_1.b2Vec2();
            b2DynamicTree.s_v = new b2Math_1.b2Vec2();
            b2DynamicTree.s_abs_v = new b2Math_1.b2Vec2();
            b2DynamicTree.s_segmentAABB = new b2Collision_1.b2AABB();
            b2DynamicTree.s_subInput = new b2Collision_1.b2RayCastInput();
            b2DynamicTree.s_combinedAABB = new b2Collision_1.b2AABB();
            b2DynamicTree.s_aabb = new b2Collision_1.b2AABB();
            b2DynamicTree.s_node_id = 0;
            exports_1("b2DynamicTree", b2DynamicTree);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYjJEeW5hbWljVHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImIyRHluYW1pY1RyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQkU7Ozs7O0lBUUYsU0FBUyxNQUFNLENBQUksS0FBZTtRQUNoQyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFBRSxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7U0FBRTtRQUMxQyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBRUQsZ0ZBQWdGO1lBQ2hGLGFBQUEsTUFBYSxVQUFVO2dCQWlCckIsWUFBWSxLQUFhLENBQUM7b0JBaEJWLFNBQUksR0FBVyxDQUFDLENBQUM7b0JBQ2pCLFNBQUksR0FBVyxJQUFJLG9CQUFNLEVBQUUsQ0FBQztvQkFDcEMsY0FBUyxHQUFhLElBQUksQ0FBQztvQkFTNUIsV0FBTSxHQUF5QixJQUFJLENBQUMsQ0FBQyxVQUFVO29CQUMvQyxXQUFNLEdBQXlCLElBQUksQ0FBQztvQkFDcEMsV0FBTSxHQUF5QixJQUFJLENBQUM7b0JBQ3BDLFdBQU0sR0FBVyxDQUFDLENBQUMsQ0FBQywyQkFBMkI7b0JBR3BELElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNqQixDQUFDO2dCQWZELElBQVcsUUFBUTtvQkFDakIsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRTt3QkFBRSxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7cUJBQUU7b0JBQ25ELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDeEIsQ0FBQztnQkFDRCxJQUFXLFFBQVEsQ0FBQyxLQUFRO29CQUMxQixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO3dCQUFFLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztxQkFBRTtvQkFDbkQsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7Z0JBQ3pCLENBQUM7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RyxDQUFDLENBQUM7NEJBQ2IsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7NEJBQ2IsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7NEJBQ2IsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ2hDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUVoQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxjQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQ3pDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLGNBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQzt5QkFDMUM7NkJBQU07NEJBQ0wsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7NEJBQ2IsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7NEJBQ2IsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7NEJBQ2IsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ2hDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUVoQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxjQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQ3pDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLGNBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQzt5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