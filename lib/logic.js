/**
 * when booking any room
 * @param {org.acme.hotelbooking.Bookroom} roombook - to book a room
 * @transaction
 */



async function roombook(roombook){
    const room = roombook.room;
    const client = roombook.client;
    const NS =  'org.acme.hotelbooking';
    const n = roombook.no_of_days;
    if (room.status == 'AVAILABLE' || room.status == 'CANCELLED'){
            
    
            if (client.balance >= (room.cost)*n){
            
                    room.status = 'BOOKED';
                    client.balance = client.balance - (room.cost*n);
                    room.hotel.balance = room.hotel.balance + (room.cost*n);

                    const factory = getFactory();
                    const order = factory.newResource( NS , 'Order' , roombook.id);
                    order.client = factory.newRelationship(NS ,  'Client' , client.ID); 
                   
                    order.room = factory.newRelationship(NS ,  'Room' , room.iD);
                    order.from = roombook.from;
                    order.to = roombook.to;
                    order.no_of_days = roombook.no_of_days;
    
                   const assetregistry = await getAssetRegistry(NS + '.Order');
                   await assetregistry.add(order);

                   const participantregistry = await getParticipantRegistry(NS + '.Client');
                   await participantregistry.update(client);

                   const assetregistries = await getParticipantRegistry(NS + '.Hotel');
                   await  participantregistry.update(room.hotel);
            }
    }
              
              
         
}                



/**
* when cancelling any room
*@param { org.acme.hotelbooking.Cancelroom} ordercancel -to cancel a room
*@transaction
*/

async function ordercancel(ordercancel){
    const room = ordercancel.room ;
    const client = ordercancel.client ;
    const order = ordercancel.order ;
    const n = order.to - order.from;

    const NS =  'org.acme.hotelbooking';
    if( order.client == client && room.status == 'BOOKED'){
            room.status = 'CANCELLED';
            client.balance = client.balance + ( n * room.cost);
            room.hotel.balance =  room.hotel.balance - ( n * room.cost);
    }
         const assetregistry = await getAssetRegistry(NS + '.Order');
         await assetregistry.remove(order);

         const participantregistry = await getParticipantRegistry(NS + '.Client');
         await participantregistry.update(client);

         const participantsregistry = await getParticipantRegistry(NS + '.Hotel');
         await participantsregistry.update(room.hotel);

         const assetsregistry = await getAssetRegistry(NS + '.Room');
         await assetsregistry.update(room);
}


/**
* when cancelling any room
*@param { org.acme.hotelbooking.Durationcomplete}
completeduration-duration for the room is over
*@transaction
*/

async function completeduration(completeduration){
    var room = completeduration.room;
    var order = completeduration.order;
    var NS =  'org.acme.hotelbooking';
    if (room.status == 'BOOKED'){
            room.status = 'AVAILABLE';
    }
    const assetregistries = await getAssetRegistry(NS + '.Room');
    await assetregistries.update(room);

    const assetregistry = await getAssetRegistry(NS + '.Order');
    await assetregistry.remove(order);
}



