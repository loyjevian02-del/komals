package com.jmaart.catalog.lead;

import com.jmaart.catalog.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/** A sales lead originating from an external channel (currently: WhatsApp via wacrm). */
@Entity
@Table(name = "lead")
@Getter
@Setter
public class Lead extends BaseEntity {

    private String customerName;

    @Column(nullable = false)
    private String customerPhone;

    /** Snapshot of the product the lead was about, not a JPA relation (product may change/be deleted later). */
    private String productId;
    private String productTitle;

    @Column(columnDefinition = "text")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.NEW;

    private BigDecimal amount;

    /** wacrm's conversation/contact id, used to upsert instead of duplicating a lead on repeat webhook calls. */
    @Column(unique = true)
    private String waConversationId;

    @Column(nullable = false)
    private String source = "whatsapp";

    public enum Status { NEW, CONTACTED, WON, LOST }
}
