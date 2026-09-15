export default function handler(req, res) {

    res.status(200).json({

        success: true,

        service: "Market Renzz API",

        status: "online",

        time: new Date().toISOString()

    });

}
