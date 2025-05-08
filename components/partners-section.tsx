"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function PartnersSection() {
  const partners = [
    { name: "AutoRoom", logo: "/1.png" },
    { name: "Lontananza", logo: "/3.png" },
    { name: "ApartaCar", logo: "/5.png" },
    { name: "GrataCanela", logo: "/6.png" },
    { name: "VInteractiv", logo: "/4.png" },
    { name: "Da Fries", logo: "/dafries.png" },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Ya son más de 100+ empresas que automatizan sus ventas con BEXOR</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-center h-52 transition-all duration-300 hover:scale-110"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="max-h-44 max-w-[95%] object-contain" 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
